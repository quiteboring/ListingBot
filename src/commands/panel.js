import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuComponent,
} from 'discord.js';
import { successEmbed } from '../utils/embed.js';
import colors from '../colors.js';

export default {
  data: new SlashCommandBuilder()
    .setName('panel')
    .setDescription('Create panels for your shop!')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
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
        .setName('sellaccount')
        .setDescription('Create a sell account panel.'),
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
      case 'sellaccount':
        await this.sendSellAccountPanel(interaction);
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
      (await client.db.get(`config_${interaction.guild.id}`))
        ?.coinBuyPrice || 'unknown';
    const sellPrice =
      (await client.db.get(`config_${interaction.guild.id}`))
        ?.coinSellPrice || 'unknown';

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
        ]).setDescription(
          'To open a ticket, press a button below.\n\n**Current Stock:** 0',
        ),
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
        new ButtonBuilder()
          .setCustomId('update_stock')
          .setStyle(ButtonStyle.Secondary)
          .setLabel('Update Stock')
          .setEmoji('📦'),
      ),
    });
  },

  async sendMiddlemanPanel(client, interaction) {
    const details =
      (await client.db.get(`config_${interaction.guild.id}`))
        ?.middlemanDetails || 'No Details Provided';

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
      (await client.db.get(`config_${interaction.guild.id}`))
        ?.exchangeDetails || 'No Details Provided';

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
    const emojis = (await client.db.get(`emojis`)) || {};

    const ranks = [
      { key: 'mfaNon', label: 'Non', emojiKey: 'non' },
      { key: 'mfaVip', label: 'VIP', emojiKey: 'vip' },
      { key: 'mfaVipPlus', label: 'VIP+', emojiKey: 'vip_plus' },
      { key: 'mfaMvp', label: 'MVP', emojiKey: 'mvp' },
      { key: 'mfaMvpPlus', label: 'MVP+', emojiKey: 'mvp_plus' },
      {
        key: 'mfaMvpPlusPlus',
        label: 'MVP++',
        emojiKey: 'mvp_plus_plus',
      },
    ];

    const availableRanks = await Promise.all(
      ranks.map(async (r) => {
        return {
          ...r,
          emoji: emojis?.[r.emojiKey] ?? null,
          price: config[r.key] ?? 'none',
        };
      }),
    );

    const filteredRanks = availableRanks.filter(
      (r) =>
        r.price != null && r.price != undefined && r.price != 'none',
    );

    await interaction.channel.send({
      embeds: [
        this.baseEmbed('MFA', [
          {
            name: 'Available Ranks & Prices',
            value:
              filteredRanks
                .map((r) => `${r.label}: **$${r.price}**`)
                .join('\n') || 'No ranks available at the moment.',
          },
        ]),
      ],

      components: filteredRanks.length
        ? this.singleRow(
            new StringSelectMenuBuilder()
              .setCustomId('mfa_ticket')
              .setPlaceholder('Choose an option...')
              .addOptions(
                filteredRanks.map((r) => ({
                  label: r.label,
                  description: `Price: $${r.price}`,
                  value: r.key.toLowerCase(),
                  ...(r.emoji ? { emoji: r.emoji } : {}),
                })),
              ),
          )
        : [],
    });
  },

  async sendSellAccountPanel(interaction) {
    await interaction.channel.send({
      embeds: [this.baseEmbed('Sell Account', [])],

      components: this.singleRow(
        new ButtonBuilder()
          .setCustomId('sell_account_ticket')
          .setStyle(ButtonStyle.Secondary)
          .setLabel('Sell Account')
          .setEmoji('💰'),
      ),
    });
  },

  baseEmbed(type, fields) {
    const spacer = { name: ' ', value: ' ' };
    const embed = new EmbedBuilder()
      .setTitle(`${type} Panel`)
      .setDescription('To open a ticket, press a button below.')
      .setFooter({
        iconURL: 'https://quiteboring.dev/pfp.jpg',
        text: 'Made by Nathan | https://quiteboring.dev',
      })
      .setColor(colors.mainColor);

    if (fields.length != 0)
      embed.setFields([spacer, ...fields, spacer]);
    else embed.setFields([spacer]);

    return embed;
  },

  singleRow(...buttons) {
    return [new ActionRowBuilder().addComponents(...buttons)];
  },
};
