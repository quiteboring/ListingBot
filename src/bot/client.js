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

export default class Bot extends Client {
  /**
   * @param {string} token
   * @param {string} clientId
   */
  constructor(token, clientId) {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
      ],
    });

    this.token = token;
    this.clientId = clientId;
    this.rest = new REST().setToken(this.token);
    this.commands = new Collection();
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
      const command = await import(filePath);

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
    const eventFiles = fs
      .readdirSync(eventsPath)
      .filter((file) => file.endsWith('.js'));

    for (const file of eventFiles) {
      const filePath = path.join(eventsPath, file);
      const event = await import(filePath);

      this.on(
        event.default.name,
        async (...args) => await event.default.execute(this, ...args),
      );
    }
  }

  async start() {
    await this.loadCommands();
    await this.loadEvents();
    this.login(this.token);
  }
}
