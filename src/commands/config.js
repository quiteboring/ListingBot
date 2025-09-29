import {
  PermissionFlagsBits,
  SlashCommandBuilder,
  TextInputStyle,
} from 'discord.js';
import { mainEmbed } from '../utils/embed.js';
import { showModal } from '../utils/tickets.js';

export default {
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription(
      'User friendly way to configure details for each panel!',
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((sub) =>
      sub
        .setName('exchange')
        .setDescription('Set exchange panel details.'),
    )
    .addSubcommand((sub) =>
      sub.setName('coins').setDescription('Set coin prices.'),
    )
    .addSubcommand((sub) =>
      sub
        .setName('middleman')
        .setDescription('Set middleman panel details.'),
    )
    .addSubcommand((sub) =>
      sub.setName('mfa').setDescription('Set MFA prices.'),
    ),

  /**
   * @param {import('../bot/client.js').default} client
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(client, interaction) {
    const sub = interaction.options.getSubcommand();

    switch (sub) {
      case 'exchange':
        return await showModal(
          interaction,
          [
            {
              customId: 'details',
              label: 'Exchange Details',
              style: TextInputStyle.Paragraph,
              placeholder: 'None',
            },
          ],
          'exchange_panel_config',
        );
      case 'coins':
        return await showModal(
          interaction,
          [
            {
              customId: 'buy_price',
              label: 'Buy Price',
              placeholder: '0.03',
            },
            {
              customId: 'sell_price',
              label: 'Sell Price',
              placeholder: '0.02',
            },
          ],
          'coins_panel_config',
        );
      case 'middleman':
        return await showModal(
          interaction,
          [
            {
              customId: 'details',
              label: 'Middleman Details',
              style: TextInputStyle.Paragraph,
              placeholder: 'None',
            },
          ],
          'middleman_panel_config',
        );
      case 'mfa':
        return await showModal(
          interaction,
          [
            {
              customId: 'mfaNon',
              label: 'Non Price',
              placeholder: 'none',
              required: false,
            },
            {
              customId: 'mfaVip',
              label: 'VIP Price',
              placeholder: 'none',
              required: false,
            },
            {
              customId: 'mfaVipPlus',
              label: 'VIP+ Price',
              placeholder: 'none',
              required: false,
            },
            {
              customId: 'mfaMvp',
              label: 'MVP Price',
              placeholder: 'none',
              required: false,
            },
            {
              customId: 'mfaMvpPlus',
              label: 'MVP+ Price',
              placeholder: 'none',
              required: false,
            },
          ],
          'mfa_panel_config',
        );
    }
  },
};
