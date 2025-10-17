import {
  Client,
  Collection,
  GatewayIntentBits,
  REST,
  Routes,
} from 'discord.js';
import { fileURLToPath } from 'url';
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
  constructor(token, clientId, hyApiKey, ownerId) {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessageTyping,
      ],
    });

    this.token = token;
    this.hyApiKey = hyApiKey;
    this.clientId = clientId;
    this.ownerId = ownerId;

    this.db = new QuickDB({ filePath: 'database.sqlite' });

    this.commands = new Collection();
    this.rest = new REST().setToken(this.token);
  }

  async loadCommands() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const commandsPath = path.join(__dirname, '../commands');
    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter((file) => file.endsWith('.js'));

    const commandsToDeploy = [];

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = await import(`file://${filePath}`);

      if ('data' in command.default && 'execute' in command.default) {
        this.commands.set(command.default.data.name, command.default);
        commandsToDeploy.push(command.default.data.toJSON());
      } else {
        logger.warn(
          `The command at ${filePath} is missing a required "data" or "execute" property.`,
        );
      }
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
      logger.error(error);
    }
  }

  async loadEvents() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const eventsPath = path.join(__dirname, '../events');

    const readEvents = async (dir) => {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          await readEvents(filePath);
        } else if (file.endsWith('.js')) {
          const event = await import(`file://${filePath}`);
          this.on(
            event.default.name,
            async (...args) =>
              await event.default.execute(this, ...args),
          );
        }
      }
    };

    await readEvents(eventsPath);
  }

  async start() {
    await this.loadCommands();
    await this.loadEvents();
    this.login(this.token);
  }
}
