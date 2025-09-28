import { SlashCommandBuilder } from 'discord.js';
import { mainEmbed } from '../utils/embed.js';

export default {
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription(
      'User friendly way to configure details for each panel!',
    ),

  /**
   * @param {import('../bot/client.js').default} client
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(client, interaction) {
    await interaction.reply({
      embeds: [mainEmbed('To be implemented!')],
    });
  },
};
