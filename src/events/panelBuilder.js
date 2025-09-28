import {
  handleDetailsSubmission,
  sendDetailsModal,
} from '../utils/panel/panelDetails.js';
import { logger } from '../utils/logger.js';

export default {
  name: 'interactionCreate',

  /**
   * @param {import("../bot/client").default} client
   * @param {import("discord.js").Interaction} interaction
   */
  async execute(client, interaction) {
    try {
      if (interaction.isButton()) {
        switch (interaction.customId) {
          case 'set_panel_details':
            return await sendDetailsModal(client, interaction);
          case 'add_panel_button':
            break;
          case 'remove_panel_button':
            break;
          case 'next_step':
            break;
          default:
            return;
        }
      }

      if (interaction.isModalSubmit()) {
        switch (interaction.customId) {
          case 'set_panel_details':
            return await handleDetailsSubmission(client, interaction);
          default:
            return;
        }
      }
    } catch (err) {
      logger.error(err);
    }
  },
};
