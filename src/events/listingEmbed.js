import { createAccountChannel } from '../utils/listing.js';

export default {
  name: 'interactionCreate',

  /**
   * @param {import("../bot/client.js").default} client
   * @param {import("discord.js").Interaction} interaction
   */
  async execute(client, interaction) {
    // For the intial listing command
    if (
      interaction.isModalSubmit() &&
      interaction.customId == 'create_account_listing'
    ) {
      const username =
        interaction.fields.getTextInputValue('username');
      const price = interaction.fields.getTextInputValue('price');

      await createAccountChannel(
        client,
        interaction,
        username,
        price,
      );
    }

    // For the actual account embed
    if (interaction.isButton()) {
    } else if (interaction.isStringSelectMenu()) {
    }
  },
};
