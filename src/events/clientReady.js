import { logger } from '../utils/logger.js';

export default {
  name: 'clientReady',

  /**
   * @param {import("../bot/client.js").default} client
   */
  async execute(client) {
    try {
      if (!client.user) {
        logger.error('Client ready event fired but client.user is null');
        return;
      }

      logger.info(`Bot ready! Logged in as ${client.user.tag} (${client.user.id})`);
      logger.info(`Connected to ${client.guilds.cache.size} guild(s)`);

      // log some startup information
      if (client.commands && client.commands.size > 0) {
        logger.info(`Loaded ${client.commands.size} command(s)`);
      }

      if (client.db) {
        logger.info('Database connection available');
      }

    } catch (error) {
      logger.error('Error in clientReady event:', error);
    }
  },
};
