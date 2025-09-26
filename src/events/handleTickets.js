import { createModal } from '../utils/modal.js';
import { createTicketChannel } from '../utils/ticket.js';

export default {
  name: 'interactionCreate',

  /**
   * @param {import("../bot/client.js").default} client
   * @param {import("discord.js").Interaction} interaction
   */
  async execute(client, interaction) {
    if (interaction.isButton()) {
      switch (interaction.customId) {
        case 'create_exchange_ticket':
          await createModal(client, interaction, 'Exchange Ticket', [
            { customId: 'from_currency', label: 'What currency?' },
            { customId: 'to_currency', label: 'Convert to what?' },
            { customId: 'amount', label: 'How much?' },
          ]);
          break;
        case 'create_buy_coins_ticket':
          await createModal(client, interaction, 'Buy Coins Ticket', [
            { customId: 'amount', label: 'How much?' },
            { customId: 'currency', label: 'What currency?' },
          ]);
          break;
        case 'create_sell_coins_ticket':
          await createModal(client, interaction, 'Sell Coins Ticket', [
            { customId: 'amount', label: 'How much?' },
            { customId: 'currency', label: 'What currency?' },
          ]);
          break;
      }
    }

    if (interaction.isModalSubmit()) {
      let fields;
      let title;

      switch (interaction.customId) {
        case 'create_exchange_ticket':
          title = ':money_with_wings: Exchange Ticket';
          fields = [
            {
              name: 'From Currency',
              value: interaction.fields.getTextInputValue('from_currency'),
            },
            {
              name: 'To Currency',
              value: interaction.fields.getTextInputValue('to_currency'),
            },
            {
              name: 'Amount',
              value: interaction.fields.getTextInputValue('amount'),
            },
          ];
          break;
        case 'create_buy_coins_ticket':
          title = ':shopping_cart: Buy Coins Ticket';
          fields = [
            {
              name: 'Amount',
              value: interaction.fields.getTextInputValue('amount'),
            },
            {
              name: 'Currency',
              value: interaction.fields.getTextInputValue('currency'),
            },
          ];
          break;
        case 'create_sell_coins_ticket':
          title = ':moneybag: Sell Coins Ticket';
          fields = [
            {
              name: 'Amount',
              value: interaction.fields.getTextInputValue('amount'),
            },
            {
              name: 'Currency',
              value: interaction.fields.getTextInputValue('currency'),
            },
          ];
          break;
      }

      if (title && fields) {
        await createTicketChannel(client, interaction, title, fields);
      }
    }
  },
};

