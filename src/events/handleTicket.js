export default {
  name: 'interactionCreate',

  /**
   * @param {import("../bot/client").default} client
   * @param {import("discord.js").Interaction} interaction
   */
  async execute(client, interaction) {
    if (
      !interaction.isStringSelectMenu() ||
      !interaction.isButton() ||
      !interaction.isModalSubmit()
    )
      return;

    await interaction.deferUpdate();

    switch (interaction.customId) {
      // General Button + Modal interactions
      case 'sell_coins_ticket':
        break;
      case 'buy_coins_ticket':
        break;
      case 'middleman_ticket':
        break;
      case 'exchange_ticket':
        break;
      case 'sell_account_ticket':
        break;
      case 'mfa_ticket':
        break;

      // Within ticket handling
      case 'close_ticket':
        break;
      case 'reopen_ticket':
        break;
      case 'delete_ticket':
        break;
      case 'transcript_ticket':
        break;
      case 'claim_ticket':
        break;
      case 'unclaim_ticket':
        break;
    }
  },
};
