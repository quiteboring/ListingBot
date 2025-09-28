import { logger } from '../utils/logger.js';

export default {
  name: 'clientReady',

  /**
   * @param {import("../bot/client.js").default} client
   */
  async execute(client) {
    logger.info(`Ready! Logged in as ${client.user.tag}`);
  },
};
