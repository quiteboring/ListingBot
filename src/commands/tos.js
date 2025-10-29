import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
  ModalBuilder,
  SlashCommandBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import colors from '../utils/colors.js';
import { isSeller } from '../utils/checks.js';
import { errorEmbed } from '../utils/embeds.js';

export default {
  data: new SlashCommandBuilder()
    .setName('tos')
    .setDescription('Terms of service for the server.')
    .addSubcommand((sub) =>
      sub
        .setName('view')
        .setDescription('View the terms of service.'),
    )
    .addSubcommand((sub) =>
      sub
        .setName('edit')
        .setDescription('Edit the terms of service.'),
    ),

  /**
   * @param {import('../bot/client.js').default} client
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(client, interaction) {
    const subcmd = interaction.options.getSubcommand();
    const guild =
      (await client.db.get(`guild_${interaction.guild.id}`)) || {};
    const tos = guild?.tos || {};

    switch (subcmd) {
      case 'view':
        const embed = new EmbedBuilder()
          .setTitle('Terms of Service')
          .setDescription(tos?.message || 'No terms of service set.')
          .setFooter({
            text: `${interaction.guild.name} TOS`,
            iconURL: interaction.guild.iconURL(),
          })
          .setColor(colors.mainColor)
          .setTimestamp();

        const users = tos?.users || [];
        const hasAccepted = users.includes(interaction.user.id);

        await interaction.reply({
          embeds: [embed],
          components: [
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId('tos:accept')
                .setLabel(hasAccepted ? 'Accepted' : 'Accept Terms')
                .setStyle(ButtonStyle.Success)
                .setDisabled(hasAccepted),
            ),
          ],
          flags: MessageFlags.Ephemeral,
        });
        break;
      case 'edit':
        if (!(await isSeller(client, interaction.member))) {
          return await interaction.reply({
            embeds: [
              errorEmbed(
                'Insufficient permissions to use this command.',
              ),
            ],
            flags: MessageFlags.Ephemeral,
          });
        }

        const modal = new ModalBuilder()
          .setCustomId('tos:edit')
          .setTitle('Edit Terms of Service')
          .addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId('tos')
                .setLabel('Terms of Service')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('Enter the new terms of service')
                .setRequired(true)
                .setValue(guild?.tos?.message || ''),
            ),
          );

        await interaction.showModal(modal);
        break;
    }
  },
};
