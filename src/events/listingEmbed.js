import {
  createAccountChannel,
  createAccountTicket,
  unlistAccount,
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

    if (interaction.isButton()) {
      const id = interaction.customId;

      if (id.startsWith('buy_account')) {
        await createAccountTicket(client, interaction);
      } else if (id.startsWith('unlist_account')) {
        await unlistAccount(
          client,
          interaction,
          interaction.channel.id,
        );
      }
    }
  },
};
