import {
  createAccountChannel,
  createAccountTicket,
} from '../utils/listing.js';

export default {
  name: 'interactionCreate',

  /**
   * @param {import("../bot/client.js").default} client
   * @param {import("discord.js").Interaction} interaction
   */
  async execute(client, interaction) {
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

    if (
      interaction.isButton() &&
      interaction.customId.startsWith('buy_account')
    ) {
      await createAccountTicket(client, interaction);
    }
  },
};
