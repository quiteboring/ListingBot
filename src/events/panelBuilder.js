import {
  handleDetailsSubmission,
  sendDetailsModal,
} from '../utils/panel/panelDetails.js';

export default {
  name: 'interactionCreate',

  /**
   * @param {import("../bot/client").default} client
   * @param {import("discord.js").Interaction} interaction
   */
  async execute(client, interaction) {
    try {
      const msg = interaction.message;

      if (interaction.isButton()) {
        switch (interaction.customId) {
          case 'set_panel_details':
            await sendDetailsModal(client, interaction);
            break;
          case 'add_button':
            break;
          case 'remove_button':
            break;
          case 'add_question':
            break;
          case 'remove_question':
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
            await handleDetailsSubmission(client, interaction);
            break;
          case 'add_button':
            break;
          case 'remove_button':
            break;
          case 'add_question':
            break;
          case 'remove_question':
            break;
          default:
            return;
        }
      }
    } catch (err) {}
  },
};

/**
 * Goes from settin panel name to then setting panel description
 * Setting panel buttons by clicking (add button) (remove button)
 * Setting modal for each button
 */
