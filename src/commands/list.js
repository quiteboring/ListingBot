import { SlashCommandBuilder } from 'discord.js';
import { mainEmbed } from '../utils/embed.js';

export default {
  data: new SlashCommandBuilder()
    .setName('list')
    .setDescription('List an account for the server!'),

  /**
   * @param {import('../bot/client.js').default} client
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(client, interaction) {
    await interaction.reply({ embeds: [mainEmbed('To be implemented!')] });
  },
};
