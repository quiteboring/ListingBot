import {
  ActionRowBuilder,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
} from 'discord.js';
import colors from '../colors.js';
import { hasAdmin, isSeller } from '../utils/member.js';

export default {
  data: new SlashCommandBuilder()
    .setName('payment')
    .setDescription('Set your payment types. (per user)'),

  /**
   * @param {import('../bot/client.js').default} client
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(client, interaction) {
    const key = `setup_${interaction.guild.id}`;
    const emojis = (await client.db.get(`emojis`)) || {};
    const ticket = await client.db.get(key);

    if (!ticket || !ticket.creatorId) {
      return interaction.reply({
        embeds: [
          errorEmbed('Server has not been setup. Run /setup wizard'),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    if (
      !hasAdmin(interaction) &&
      !(await isSeller(client, interaction))
    ) {
      return interaction.reply({
        embeds: [errorEmbed('You cannot unlist this account.')],
        flags: MessageFlags.Ephemeral,
      });
    }

    const embed = new EmbedBuilder()
      .setTitle('Setup Payment Methods')
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
            .setCustomId('payment_method_select')
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
      ],

      flags: MessageFlags.Ephemeral,
    });
  },
};
