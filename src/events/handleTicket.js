import { createTicket, showModal } from '../utils/tickets.js';

export default {
  name: 'interactionCreate',

  /**
   * @param {import("../bot/client").default} client
   * @param {import("discord.js").Interaction} interaction
   */
  async execute(client, interaction) {
    if (
      !interaction.isStringSelectMenu() &&
      !interaction.isButton() &&
      !interaction.isModalSubmit()
    )
      return;

    switch (interaction.customId) {
      case 'sell_coins_ticket':
      case 'buy_coins_ticket':
        return await this.handleCoinsTicket(client, interaction);
      case 'middleman_ticket':
        return await this.handleMiddlemanTicket(client, interaction);
      case 'exchange_ticket':
        return await this.handleExchangeTicket(client, interaction);
      case 'sell_account_ticket':
        return await this.handleSellAccountTicket(
          client,
          interaction,
        );
      case 'mfa_ticket':
        return await createTicket(client, interaction);
      case 'close_ticket':
        return await this.closeTicket(client, interaction);
      case 'reopen_ticket':
        return await this.reopenTicket(client, interaction);
      case 'delete_ticket':
        return await this.deleteTicket(client, interaction);
      case 'transcript_ticket':
        return await this.transcriptTicket(client, interaction);
      case 'claim_ticket':
        return await this.claimTicket(client, interaction);
      case 'unclaim_ticket':
        return await this.unclaimTicket(client, interaction);
    }
  },

  // General Button + Modal interactions
  async handleCoinsTicket(client, interaction) {
    if (interaction.isButton()) {
      await showModal(interaction, [
        {
          customId: 'username',
          label: 'Minecraft Username',
          placeholder: 'Refraction',
        },
        {
          customId: 'method',
          label: 'Method of Payment',
          placeholder: 'LTC',
        },
        {
          customId: 'amount',
          label: 'Amount of Coins',
          placeholder: '100m',
        },
      ]);
    } else if (interaction.isModalSubmit()) {
      await createTicket(client, interaction);
    }
  },

  async handleMiddlemanTicket(client, interaction) {
    if (interaction.isButton()) {
      await showModal(interaction, [
        {
          customId: 'userId',
          label: 'ID of other Person',
          placeholder: 'ex: 1367543367277219840',
        },
        {
          customId: 'details',
          label: 'Details',
          placeholder: 'Type here...',
        },
      ]);
    } else if (interaction.isModalSubmit()) {
      await createTicket(client, interaction);
    }
  },

  async handleExchangeTicket(client, interaction) {
    if (interaction.isButton()) {
      await showModal(interaction, [
        {
          customId: 'currency_from',
          label: 'Currency From',
          placeholder: 'LTC',
        },
        {
          customId: 'currency_to',
          label: 'Currency To',
          placeholder: 'PayPal',
        },
        {
          customId: 'amount',
          label: 'Amount',
          placeholder: '100$',
        },
      ]);
    } else if (interaction.isModalSubmit()) {
      await createTicket(client, interaction);
    }
  },

  async handleSellAccountTicket(client, interaction) {
    if (interaction.isButton()) {
      await showModal(interaction, [
        {
          customId: 'username',
          label: 'Minecraft Username',
          placeholder: 'Refraction',
        },
        {
          customId: 'asking_price',
          label: 'Asking Price',
          placeholder: 'PayPal',
        },
      ]);
    } else if (interaction.isModalSubmit()) {
      await createTicket(client, interaction);
    }
  },

  // Within ticket handling
  async closeTicket(client, interaction) {},

  async reopenTicket(client, interaction) {},

  async deleteTicket(client, interaction) {},

  async transcriptTicket(client, interaction) {},

  async claimTicket(client, interaction) {},

  async unclaimTicket(client, interaction) {},
};
