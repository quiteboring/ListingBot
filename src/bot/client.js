import {
  Client,
  Collection,
  GatewayIntentBits,
  REST,
  Routes,
} from 'discord.js';
import { fileURLToPath, pathToFileURL } from 'url';
import { logger } from '../utils/logger.js';
import fs from 'fs';
import path from 'path';
import { QuickDB } from 'quick.db';

export default class Bot extends Client {
  /**
   * @param {string} token
   * @param {string} clientId
   * @param {string} databaseUrl
   */
  constructor(token, clientId, databaseUrl) {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessageTyping,
      ],
    });

    this.token = token;
    this.clientId = clientId;

    // Use database URL or 'database.sqlite'
    const dbPath = databaseUrl || 'database.sqlite';
    this.db = new QuickDB({ filePath: dbPath });

    this.commands = new Collection();
    this.rest = new REST().setToken(this.token);
  }

  async loadCommands() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const commandsPath = path.join(__dirname, '../commands');
    
    try {
      const commandFiles = fs
        .readdirSync(commandsPath)
        .filter((file) => file.endsWith('.js'));

      if (commandFiles.length === 0) {
        logger.warn('No command files found in commands directory');
        return;
      }

      const commandsToDeploy = [];
      const loadedCommands = [];
      const failedCommands = [];

      for (const file of commandFiles) {
        try {
          const filePath = path.join(commandsPath, file);
          
          if (!fs.existsSync(filePath)) {
            logger.warn(`Command file not found: ${filePath}`);
            failedCommands.push({ file, error: 'File not found' });
            continue;
          }

          const command = await import(pathToFileURL(filePath).href);

          if (!command.default) {
            logger.warn(`Command file ${file} does not export a default export. Skipping.`);
            failedCommands.push({ file, error: 'No default export' });
            continue;
          }

          if (!('data' in command.default) || !('execute' in command.default)) {
            logger.warn(
              `The command at ${filePath} is missing a required "data" or "execute" property.`,
            );
            failedCommands.push({ file, error: 'Missing data or execute property' });
            continue;
          }

          if (!command.default.data || !command.default.data.name) {
            logger.warn(`Command at ${filePath} has invalid data structure.`);
            failedCommands.push({ file, error: 'Invalid data structure' });
            continue;
          }

          this.commands.set(command.default.data.name, command.default);
          commandsToDeploy.push(command.default.data.toJSON());
          loadedCommands.push(file);

          logger.debug(`Loaded command: ${command.default.data.name} from ${file}`);
        } catch (error) {
          logger.error(`Failed to load command file ${file}:`, error);
          failedCommands.push({ file, error: error.message });
        }
      }

      logger.info(`Loaded ${loadedCommands.length} commands, ${failedCommands.length} failed`);

      if (failedCommands.length > 0) {
        logger.warn('Failed to load the following commands:');
        failedCommands.forEach(({ file, error }) => {
          logger.warn(`  - ${file}: ${error}`);
        });
      }

      if (commandsToDeploy.length === 0) {
        logger.error('No commands to deploy. Bot will not have any slash commands available.');
        return;
      }

      try {
        logger.info(
          `Started refreshing ${commandsToDeploy.length} application (/) commands.`,
        );

        const data = await this.rest.put(
          Routes.applicationCommands(this.clientId),
          { body: commandsToDeploy },
        );

        logger.info(
          `Successfully reloaded ${data.length} application (/) commands.`,
        );
      } catch (error) {
        logger.error('Failed to deploy commands to Discord:', error);
        throw new Error(`Command deployment failed: ${error.message}`);
      }
    } catch (error) {
      logger.error('Failed to load commands:', error);
      throw error;
    }
  }

  async loadEvents() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const eventsPath = path.join(__dirname, '../events');
    
    try {
      const eventFiles = fs
        .readdirSync(eventsPath)
        .filter((file) => file.endsWith('.js'));

      const eventHandlers = new Map();

      for (const file of eventFiles) {
        try {
          const filePath = path.join(eventsPath, file);
          const event = await import(`file://${filePath}`);

          if (!event.default || !event.default.name || !event.default.execute) {
            logger.warn(`Event file ${file} is missing required properties (name or execute). Skipping.`);
            continue;
          }

          if (!eventHandlers.has(event.default.name)) {
            eventHandlers.set(event.default.name, []);
          }
          
          // store the handler for this specific event file
          eventHandlers.get(event.default.name).push(async (...args) => {
            try {
              await event.default.execute(this, ...args);
            } catch (error) {
              logger.error(`Error in event handler ${event.default.name} from ${file}:`, error);
            }
          });

          logger.debug(`Loaded event handler for '${event.default.name}' from ${file}`);
        } catch (error) {
          logger.error(`Failed to load event file ${file}:`, error);
        }
      }

      // register all event handlers
      for (const [eventName, handlers] of eventHandlers) {
        for (const handler of handlers) {
          this.on(eventName, handler);
        }
        logger.info(`Registered ${handlers.length} handler(s) for event '${eventName}'`);
      }

      logger.info(`Successfully loaded ${eventFiles.length} event files with ${eventHandlers.size} unique event types`);
    } catch (error) {
      logger.error('Failed to load events:', error);
      throw error;
    }
  }

  async start() {
    try {
      // validate required parameters
      if (!this.token) {
        throw new Error('Discord bot token is required');
      }
      if (!this.clientId) {
        throw new Error('Client ID is required');
      }

      logger.info('Starting bot initialization...');

      // load commands and events
      await this.loadCommands();
      await this.loadEvents();

      // test database connection
      try {
        await this.db.init();
        logger.info('Database connection established');
      } catch (error) {
        logger.error('Failed to initialize database:', error);
        throw new Error(`Database initialization failed: ${error.message}`);
      }

      // login to Discord
      logger.info('Attempting to login to Discord...');
      await this.login(this.token);

      this.setupGracefulShutdown();
      
    } catch (error) {
      logger.error('Failed to start bot:', error);
      throw error;
    }
  }

  setupGracefulShutdown() {
    const shutdown = async (signal) => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`);

      try {
        if (this.db) {
          logger.info('Database connection will be closed automatically (probably, yeahhhh)');
        }

        this.destroy();
        logger.info('Bot destroyed successfully');

        process.exit(0);
      } catch (error) {
        logger.error('Error during graceful shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    
    // handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      shutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      shutdown('unhandledRejection');
    });
  }
}
