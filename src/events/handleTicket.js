export default {
  name: 'interactionCreate',

  /**
   * @param {import("../bot/client").default} client
   * @param {import("discord.js").Interaction} interaction
   */
  async execute(client, interaction) {
    if (interaction.isCommand()) return 
    await interaction.deferUpdate();

    switch (interaction.customId) {
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
    }
  },
};
