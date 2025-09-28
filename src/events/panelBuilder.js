import {
  handleDetailsSubmission,
  sendDetailsModal,
} from '../utils/panel/panelDetails.js';
import {
  sendAddButtonModal,
  handleAddButtonSubmission,
  handleRemoveButton,
} from '../utils/panel/panelButtons.js';
import { logger } from '../utils/logger.js';

export default {
  name: 'interactionCreate',

  /**
   * @param {import("../bot/client").default} client
   * @param {import("discord.js").Interaction} interaction
   */
  async execute(client, interaction) {
    try {
      // validate interaction
      if (!interaction) {
        logger.warn('PanelBuilder: Received null or undefined interaction');
        return;
      }

      if (interaction.isButton()) {
        try {
          switch (interaction.customId) {
            case 'set_panel_details':
              return await sendDetailsModal(client, interaction);
            case 'add_panel_button':
              return await sendAddButtonModal(client, interaction);
            case 'remove_panel_button':
              return await handleRemoveButton(client, interaction);
            case 'next_step':
              break;
            default:
              return;
          }
        } catch (error) {
          logger.error(`Error handling button interaction (${interaction.customId}):`, error);
          throw error;
        }
      }

      if (interaction.isModalSubmit()) {
        try {
          if (
            interaction.customId.startsWith('add_panel_button_modal_')
          ) {
            return await handleAddButtonSubmission(client, interaction);
          }

          switch (interaction.customId) {
            case 'set_panel_details':
              return await handleDetailsSubmission(client, interaction);
            default:
              return;
          }
        } catch (error) {
          logger.error(`Error handling modal submission (${interaction.customId}):`, error);
          throw error;
        }
      }
    } catch (err) {
      logger.error('Error during panel builder interaction handling:', err);
    }
  },
};
