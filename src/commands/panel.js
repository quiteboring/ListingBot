import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
} from 'discord.js';
import { mainEmbed, successEmbed } from '../utils/embed.js';
import config from '../colors.js';
import colors from '../colors.js';

export default {
  data: new SlashCommandBuilder()
    .setName('panel')
    .setDescription('Create panels for your shop!')
    .addSubcommand((sub) =>
      sub.setName('coins').setDescription('Create a coin panel.'),
    )
    .addSubcommand((sub) =>
      sub
        .setName('middleman')
        .setDescription('Create a middleman panel.'),
    )
    .addSubcommand((sub) =>
      sub
        .setName('exchange')
        .setDescription('Create a exchange panel.'),
    )
    .addSubcommand((sub) =>
      sub.setName('mfa').setDescription('Create a MFA panel.'),
    )
    .addSubcommand((sub) =>
      sub
        .setName('account')
        .setDescription(
          'Create a custom account panel. (mining/farming ready account)',
        ),
    ),

  async execute(client, interaction) {
    const sub = interaction.options.getSubcommand();

    switch (sub) {
      case 'coins':
        await this.sendCoinPanel(client, interaction);
        break;
      case 'middleman':
        await this.sendMiddlemanPanel(client, interaction);
        break;
      case 'exchange':
        await this.sendExchangePanel(client, interaction);
        break;
      case 'mfa':
        await this.sendMfaPanel(client, interaction);
        break;
      case 'account':
        await this.sendAccountPanel(client, interaction);
        break;
    }

    await interaction.reply({
      embeds: [successEmbed('Successfully send embed!')],
      flags: MessageFlags.Ephemeral,
    });
  },

  /**
   * @param {import('../bot/client.js').default} client
   * @param {import('discord.js').Interaction} interaction
   */
  async sendCoinPanel(client, interaction) {
    const buyPrice =
      (await client.db.get(`config_${interaction.guild.id}`)
        .coinBuyPrice) || 'unknown';
    const sellPrice =
      (await client.db.get(`config_${interaction.guild.id}`)
        .coinSellPrice) || 'unknown';

    await interaction.channel.send({
      embeds: [
        this.baseEmbed('Coins', [
          {
            name: 'Buy Price',
            value: `Base Price: **$${buyPrice}/m**`,
            inline: true,
          },
          {
            name: '',
            value: '',
            inline: true,
          },
          {
            name: 'Sell Price',
            value: `Base Price: **$${sellPrice}/m**`,
            inline: true,
          },
        ]),
      ],

      components: this.singleRow(
        new ButtonBuilder()
          .setCustomId('buy_coins_ticket')
          .setStyle(ButtonStyle.Secondary)
          .setLabel('Buy Coins')
          .setEmoji('🛒'),
        new ButtonBuilder()
          .setCustomId('sell_coins_ticket')
          .setStyle(ButtonStyle.Secondary)
          .setLabel('Sell Coins')
          .setEmoji('💵'),
      ),
    });
  },

  async sendMiddlemanPanel(client, interaction) {
    const details =
      (await client.db.get(`config_${interaction.guild.id}`)
        .middlemanDetails) || 'No Details Provided';

    await interaction.channel.send({
      embeds: [
        this.baseEmbed('Middleman', [
          {
            name: 'Middleman Details',
            value: details,
          },
        ]),
      ],

      components: this.singleRow(
        new ButtonBuilder()
          .setCustomId('middleman_ticket')
          .setStyle(ButtonStyle.Secondary)
          .setLabel('Request Middlemen')
          .setEmoji('🤝'),
      ),
    });
  },

  async sendExchangePanel(client, interaction) {
    const details =
      (await client.db.get(`config_${interaction.guild.id}`)
        .exchangeDetails) || 'No Details Provided';

    await interaction.channel.send({
      embeds: [
        this.baseEmbed('Exchange', [
          {
            name: 'Exchange Details',
            value: details,
          },
        ]),
      ],

      components: this.singleRow(
        new ButtonBuilder()
          .setCustomId('exchange_ticket')
          .setStyle(ButtonStyle.Secondary)
          .setLabel('Get an Exchange')
          .setEmoji('🔄'),
      ),
    });
  },

  async sendMfaPanel(client, interaction) {
    const guildId = interaction.guild.id;
    const config = (await client.db.get(`config_${guildId}`)) || {};

    const ranks = [
      { key: 'mfaNon', label: 'Non' },
      { key: 'mfaVip', label: 'VIP' },
      { key: 'mfaVipPlus', label: 'VIP+' },
      { key: 'mfaMvp', label: 'MVP' },
      { key: 'mfaMvpPlus', label: 'MVP+' },
    ];

    const availableRanks = ranks
      .map((r) => ({
        ...r,
        price: config[r.key],
      }))
      .filter(
        (r) =>
          r.price !== null &&
          r.price !== undefined &&
          r.price == 'none',
      );

    await interaction.channel.send({
      embeds: [
        this.baseEmbed('MFA', [
          {
            name: 'Available Ranks & Prices',
            value:
              availableRanks
                .map((r) => `${r.label}: **$${r.price}**`)
                .join('\n') || 'No ranks available at the moment.',
          },
        ]),
      ],

      components: availableRanks.length
        ? this.singleRow(
            new StringSelectMenuBuilder()
              .setCustomId('mfa_ticket')
              .setPlaceholder('Choose an option...')
              .addOptions(
                availableRanks.map((r) => ({
                  label: r.label,
                  description: `Price: $${r.price}`,
                  value: r.key.toLowerCase(),
                })),
              ),
          )
        : [],
    });
  },

  async sendAccountPanel(client, interaction) {
    await interaction.channel.send({
      embeds: [this.baseEmbed('Account', [])],

      components: this.singleRow(
        new ButtonBuilder()
          .setCustomId('sell_account_ticket')
          .setStyle(ButtonStyle.Danger)
          .setLabel('Sell Account')
          .setEmoji('💰'),
      ),
    });
  },

  baseEmbed(type, fields = []) {
    const spacer = { name: ' ', value: ' ' };
    const embed = new EmbedBuilder()
      .setTitle(`${type} Panel`)
      .setDescription('To open a ticket, press a button below.')
      .setFooter({
        text: 'Made by Nathan | https://quiteboring.dev',
      })
      .setColor(colors.mainColor);

    if (fields.length != 0)
      embed.setFields([spacer, ...fields, spacer]);
    else 
      embed.setFields([spacer])

    return embed;
  },

  singleRow(...buttons) {
    return [new ActionRowBuilder().addComponents(...buttons)];
  },
};
