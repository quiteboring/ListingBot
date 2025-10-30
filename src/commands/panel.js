import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import { errorEmbed, successEmbed } from '../utils/embeds.js';
import { isAdmin } from '../utils/checks.js';
import colors from '../utils/colors.js';

export default {
  data: new SlashCommandBuilder()
    .setName('panel')
    .setDescription('Create a panel!')
    .addSubcommand((sub) =>
      sub.setName('coin').setDescription('Create a coin panel!'),
    )
    .addSubcommand((sub) =>
      sub
        .setName('middleman')
        .setDescription('Create a middleman panel!'),
    )
    .addSubcommand((sub) =>
      sub
        .setName('exchange')
        .setDescription('Create an exchange panel!'),
    )
    .addSubcommand((sub) =>
      sub.setName('mfa').setDescription('Create a mfa panel!'),
    )
    .addSubcommand((sub) =>
      sub
        .setName('sell_account')
        .setDescription('Create a sell account panel!'),
    ),

  /**
   * @param {import('../bot/client.js').default} client
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(client, interaction) {
    if (!isAdmin(interaction.member)) {
      await interaction.reply({
        embeds: [
          errorEmbed('Insufficient permissions to use this command.'),
        ],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case 'coin':
        await this.createCoinPanel(client, interaction);
        break;
      case 'middleman':
        await this.createMiddlemanPanel(client, interaction);
        break;
      case 'exchange':
        await this.createExchangePanel(client, interaction);
        break;
      case 'mfa':
        await this.createMfaPanel(client, interaction);
        break;
      case 'sell_account':
        await this.createSellAccountPanel(client, interaction);
        break;
      default:
        return await interaction.reply({
          embeds: [errorEmbed('Unknown subcommand.')],
          flags: MessageFlags.Ephemeral,
        });
    }

    await interaction.reply({
      embeds: [successEmbed('Panel created successfully.')],
      flags: MessageFlags.Ephemeral,
    });
  },

  async createCoinPanel(client, interaction) {
    const embed = new EmbedBuilder()
      .setTitle('Coin Panel')
      .setDescription('To open a ticket, press a button below.')
      .setColor(colors.mainColor);

    const components = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('open_ticket:buy_coins')
        .setEmoji('🛒')
        .setLabel('Buy Coins')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('open_ticket:sell_coins')
        .setEmoji('💵')
        .setLabel('Sell Coins')
        .setStyle(ButtonStyle.Secondary),
    );

    await interaction.channel.send({
      embeds: [embed],
      components: [components],
    });
  },

  async createMiddlemanPanel(client, interaction) {
    const embed = new EmbedBuilder()
      .setTitle('Middleman Panel')
      .setDescription('To open a ticket, press a button below.')
      .setColor(colors.mainColor);

    const components = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('open_ticket:middleman')
        .setEmoji('🤝')
        .setLabel('Request Middleman')
        .setStyle(ButtonStyle.Secondary),
    );

    await interaction.channel.send({
      embeds: [embed],
      components: [components],
    });
  },

  async createExchangePanel(client, interaction) {
    const embed = new EmbedBuilder()
      .setTitle('Exchange Panel')
      .setDescription('To open a ticket, press a button below.')
      .setColor(colors.mainColor);

    const components = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('open_ticket:exchange')
        .setEmoji('💱')
        .setLabel('Exchange')
        .setStyle(ButtonStyle.Secondary),
    );

    await interaction.channel.send({
      embeds: [embed],
      components: [components],
    });
  },

  async createMfaPanel(client, interaction) {
    const embed = new EmbedBuilder()
      .setTitle('MFA Panel')
      .setDescription('To open a ticket, press a button below.')
      .setColor(colors.mainColor);

    const components = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('open_ticket:mfa')
        .setEmoji('🔒')
        .setLabel('Purchase MFA')
        .setStyle(ButtonStyle.Secondary),
    );

    await interaction.channel.send({
      embeds: [embed],
      components: [components],
    });
  },

  async createSellPanel(client, interaction) {
    const embed = new EmbedBuilder()
      .setTitle(`Sell Account Panel`)
      .setDescription(
        `To sell an account, press the button below to open a ticket.`,
      )
      .setColor(colors.mainColor);

    const components = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`open_ticket:sell_account`)
        .setEmoji('💰')
        .setLabel(`Sell Account`)
        .setStyle(ButtonStyle.Secondary),
    );

    await interaction.channel.send({
      embeds: [embed],
      components: [components],
    });
  },
};
