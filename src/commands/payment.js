import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
} from 'discord.js';
import { errorEmbed } from '../utils/embeds.js';
import { isSeller } from '../utils/checks.js';
import colors from '../utils/colors.js';

export default {
  data: new SlashCommandBuilder()
    .setName('payment')
    .setDescription('Setup your personal payment methods!'),

  /**
   * @param {import('../bot/client.js').default} client
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(client, interaction) {
    const emojis = (await client.db.get(`emojis`)) || {};

    if (!isSeller(client, interaction.member)) {
      await interaction.reply({
        embeds: [
          errorEmbed('Insufficient permissions to use this command.'),
        ],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle('💳 Setup Payment Methods')
      .setDescription(
        'These will be your personal payment methods.\n\nUse the dropdown to select a method.\n\n_Not seeing it? Try searching in the dropdown._',
      )
      .setColor(colors.mainColor);

    const paymentMethods = [
      { label: 'LTC', value: 'ltc' },
      { label: 'BTC', value: 'btc' },
      { label: 'Cash App', value: 'cash_app' },
      { label: 'Apple Pay', value: 'apple_pay' },
      { label: 'Venmo', value: 'venmo' },
      { label: 'USDT', value: 'usdt' },
      { label: 'PayPal', value: 'paypal' },
    ];

    await interaction.reply({
      embeds: [embed],
      components: [
        new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId('payment_methods')
            .setPlaceholder('Select your payment methods')
            .setMinValues(1)
            .setMaxValues(paymentMethods.length)
            .addOptions(
              paymentMethods.map((method) => ({
                label: method.label,
                value: method.value,
                emoji: emojis[method.value] || undefined,
              })),
            ),
        ),
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('payment_methods:add')
            .setLabel('Confirm')
            .setStyle(ButtonStyle.Success),
        ),
      ],

      flags: MessageFlags.Ephemeral,
    });
  },
};
