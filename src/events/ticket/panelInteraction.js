import {
  Embed,
  EmbedBuilder,
  MessageFlags,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import { errorEmbed, successEmbed } from '../../utils/embeds.js';
import {
  createModal,
  createTicket,
} from '../../utils/ticket/utils.js';
import colors from '../../colors.js';

const separator = {
  name: '',
  value: '',
  inline: false,
};

export default {
  name: 'interactionCreate',

  /**
   * @param {import("../bot/client").default} client
   * @param {import("discord.js").Interaction} interaction
   */
  async execute(client, interaction) {
    if (
      !interaction.customId ||
      !interaction.customId.startsWith('open_ticket:')
    )
      return;

    const category = interaction.customId.split(':')[1];
    const setup =
      (await client.db.get(`guild_${interaction.guild.id}`)) || {};

    if (!setup || !setup.ticket_category) {
      return await interaction.reply({
        embeds: [
          errorEmbed(
            'Ticket system is not set up in this server. Please contact an administrator.',
          ),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    switch (category) {
      case 'buy_coins':
        this.handleBuyCoins(
          client,
          interaction,
          setup.ticket_category,
        );
        break;
      case 'sell_coins':
        this.handleSellCoins(
          client,
          interaction,
          setup.ticket_category,
        );
        break;
      case 'middleman':
        this.handleMiddleman(
          client,
          interaction,
          setup.ticket_category,
        );
        break;
      case 'exchange':
        this.handleExchange(
          client,
          interaction,
          setup.ticket_category,
        );
        break;
      case 'mfa':
        this.handleMfa(client, interaction, setup.ticket_category);
        break;
      case 'sell_account':
        this.handleSellAccount(
          client,
          interaction,
          setup.ticket_category,
        );
        break;
    }
  },

  async handleBuyCoins(client, interaction, category) {
    if (interaction.isButton()) {
      return await createModal(client, interaction, [
        new TextInputBuilder()
          .setCustomId('ign')
          .setLabel('IGN')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('Enter your in-game name')
          .setRequired(true),
        new TextInputBuilder()
          .setCustomId('buy_amount')
          .setLabel('Amount')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('Enter the amount of coins you want to buy')
          .setRequired(true),
        new TextInputBuilder()
          .setCustomId('currency')
          .setLabel('Currency')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('Enter the currency you want to use')
          .setRequired(true),
      ]);
    }

    await interaction.reply({
      embeds: [successEmbed('Created your ticket!')],
      flags: MessageFlags.Ephemeral,
    });

    const embed = new EmbedBuilder()
      .setTitle('Buy Coins Ticket')
      .setDescription(
        'Thank you for reaching out to buy coins! Our team will assist you shortly.',
      )
      .addFields([
        {
          name: 'IGN',
          value: interaction.fields.getTextInputValue('ign'),
          inline: true,
        },
        separator,
        {
          name: 'Amount',
          value: interaction.fields.getTextInputValue('buy_amount'),
          inline: true,
        },
        {
          name: 'Currency',
          value: interaction.fields.getTextInputValue('currency'),
          inline: true,
        },
      ])
      .setColor(colors.mainColor);

    await createTicket(
      client,
      interaction,
      category,
      'buy-coins',
      embed,
    );
  },

  async handleSellCoins(client, interaction, category) {
    if (interaction.isButton()) {
      return await createModal(client, interaction, [
        new TextInputBuilder()
          .setCustomId('ign')
          .setLabel('IGN')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('Enter your in-game name')
          .setRequired(true),
        new TextInputBuilder()
          .setCustomId('buy_amount')
          .setLabel('Amount')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('Enter the amount of coins you want to buy')
          .setRequired(true),
        new TextInputBuilder()
          .setCustomId('currency')
          .setLabel('Currency')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('Enter the currency you want to use')
          .setRequired(true),
      ]);
    }

    await interaction.reply({
      embeds: [successEmbed('Created your ticket!')],
      flags: MessageFlags.Ephemeral,
    });

    const embed = new EmbedBuilder()
      .setTitle('Sell Coins Ticket')
      .setDescription(
        'Thank you for reaching out to sell coins! Our team will assist you shortly.',
      )
      .addFields([
        {
          name: 'IGN',
          value: interaction.fields.getTextInputValue('ign'),
          inline: true,
        },
        separator,
        {
          name: 'Amount',
          value: interaction.fields.getTextInputValue('buy_amount'),
          inline: true,
        },
        {
          name: 'Currency',
          value: interaction.fields.getTextInputValue('currency'),
          inline: true,
        },
      ])
      .setColor(colors.mainColor);

    await createTicket(
      client,
      interaction,
      category,
      'sell-coins',
      embed,
    );
  },

  async handleMiddleman(client, interaction, category) {
    if (interaction.isButton()) {
      return await createModal(client, interaction, [
        new TextInputBuilder()
          .setCustomId('user_id')
          .setLabel('User ID of Other Party')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('Enter the user ID of the other party')
          .setRequired(true),
        new TextInputBuilder()
          .setCustomId('details')
          .setLabel('Details')
          .setStyle(TextInputStyle.Paragraph)
          .setPlaceholder('Enter the details of the transaction')
          .setRequired(true),
      ]);
    }

    const user = await interaction.guild.members
      .fetch(interaction.fields.getTextInputValue('user_id'))
      .catch(() => null);

    if (!user) {
      return await interaction.reply({
        embeds: [
          errorEmbed(
            'The user ID you provided is not valid or the user is not in this server.',
          ),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    await interaction.reply({
      embeds: [successEmbed('Created your ticket!')],
      flags: MessageFlags.Ephemeral,
    });

    const embed = new EmbedBuilder()
      .setTitle('Middleman Ticket')
      .setDescription(
        'Thank you for reaching out to our middleman services! Our team will assist you shortly.',
      )
      .addFields([
        {
          name: 'Other Party',
          value: `<@${interaction.fields.getTextInputValue('user_id')}>`,
          inline: true,
        },
        separator,
        {
          name: 'Details',
          value: interaction.fields.getTextInputValue('details'),
          inline: true,
        },
      ])
      .setColor(colors.mainColor);

    await createTicket(
      client,
      interaction,
      category,
      'middleman',
      embed,
      `<@${interaction.user.id}> <@${interaction.fields.getTextInputValue('user_id')}>`,
    );
  },

  async handleExchange(client, interaction, category) {
    if (interaction.isButton()) {
      return await createModal(client, interaction, [
        new TextInputBuilder()
          .setCustomId('currency_from')
          .setLabel('Currency From')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder(
            'Enter the currency you want to exchange from',
          )
          .setRequired(true),
        new TextInputBuilder()
          .setCustomId('currency_to')
          .setLabel('Currency To')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder(
            'Enter the currency you want to exchange to',
          )
          .setRequired(true),
      ]);
    }

    await interaction.reply({
      embeds: [successEmbed('Created your ticket!')],
      flags: MessageFlags.Ephemeral,
    });

    const embed = new EmbedBuilder()
      .setTitle('Exchange Ticket')
      .setDescription(
        'Thank you for reaching out to our exchange services! Our team will assist you shortly.',
      )
      .addFields([
        {
          name: 'Currency From',
          value:
            interaction.fields.getTextInputValue('currency_from'),
          inline: true,
        },
        {
          name: 'Currency To',
          value: interaction.fields.getTextInputValue('currency_to'),
          inline: true,
        },
      ])
      .setColor(colors.mainColor);

    await createTicket(
      client,
      interaction,
      category,
      'exchange',
      embed,
    );
  },

  async handleMfa(client, interaction, category) {
    const embed = new EmbedBuilder()
      .setTitle('MFA Ticket')
      .setDescription(
        'Thank you for reaching out to our MFA services! Our team will assist you shortly.',
      )
      .setColor(colors.mainColor);

    await createTicket(client, interaction, category, 'mfa', embed);
  },

  async handleSellAccount(client, interaction, category) {
    if (interaction.isButton()) {
      return await createModal(client, interaction, [
        new TextInputBuilder()
          .setCustomId('ign')
          .setLabel('IGN')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('Enter your in-game name')
          .setRequired(true),
        new TextInputBuilder()
          .setCustomId('profile_name')
          .setLabel('Profile Name')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder(
            'Enter the name of the profile you want to sell',
          )
          .setRequired(true),
        new TextInputBuilder()
          .setCustomId('asking_price')
          .setLabel('Asking Price')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder(
            'Enter the asking price for the profile you want to sell',
          )
          .setRequired(true),
        new TextInputBuilder()
          .setCustomId('currency')
          .setLabel('Currency')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder(
            'Enter the currency you want to sell the profile for',
          )
          .setRequired(true),
      ]);
    }

    await interaction.reply({
      embeds: [successEmbed('Created your ticket!')],
      flags: MessageFlags.Ephemeral,
    });

    const ign = interaction.fields.getTextInputValue('ign');
    const profileName =
      interaction.fields.getTextInputValue('profile_name');

    const embed = new EmbedBuilder()
      .setTitle('Sell Account Ticket')
      .setDescription(
        'Thank you for reaching out to sell your account! Our team will assist you shortly.',
      )
      .addFields([
        {
          name: 'IGN',
          value: ign,
          inline: true,
        },
        separator,
        {
          name: 'Profile Name',
          value: profileName,
          inline: true,
        },
        {
          name: 'Asking Price',
          value: interaction.fields.getTextInputValue('asking_price'),
          inline: true,
        },
        {
          name: 'Currency',
          value: interaction.fields.getTextInputValue('currency'),
          inline: true,
        },
      ])
      .setColor(colors.mainColor);

    const channel = await createTicket(
      client,
      interaction,
      category,
      'sell-account',
      embed,
    );

    await channel.send(
      `https://sky.shiiyu.moe/stats/${ign}/${profileName}`,
    );
  },
};
