import { EmbedBuilder, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { errorEmbed } from '../utils/embed.js';
import colors from '../colors.js';

export default {
  data: new SlashCommandBuilder()
    .setName('tos')
    .setDescription('View/edit the TOS!')
    .addSubcommand(sub => sub.setName('view').setDescription('View the Terms of Service for this server!')),

  /**
   * @param {import('../bot/client.js').default} client
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(client, interaction) {
    const key = `config_${interaction.guild.id}`;
    const data = await client.db.get(key);

    if (!data || !data?.tos) {
      return await interaction.reply({
        embeds: [errorEmbed('No TOS set in this server.')],
        flags: MessageFlags.Ephemeral
      })
    }

    const embed = new EmbedBuilder()
      .setTitle('Term\'s of Service')
      .setDescription(data.tos)
      .setColor(colors.mainColor);

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  },
};
