import {
  handleDetailsSubmission,
  sendDetailsModal,
} from '../utils/panel/panelDetails.js';
import {
  sendAddButtonModal,
  handleAddButtonSubmission,
  handleRemoveButton,
} from '../utils/panel/panelButtons.js';

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
            return await sendAddButtonModal(client, interaction);
          case 'remove_panel_button':
            return await handleRemoveButton(client, interaction);
          case 'next_step':
            break;
          default:
            return;
        }
      }

      if (interaction.isModalSubmit()) {
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
      }
    } catch (err) {
      console.error('Error during interaction handling:', err);
    }
  },
};
