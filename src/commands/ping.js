import { SlashCommandBuilder } from 'discord.js';
import { mainEmbed } from '../utils/embeds.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Pong!'),

  /**
   * @param {import('../bot/client.js').default} client
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(client, interaction) {
    await interaction.reply({ embeds: [mainEmbed('Pong!')] });
  },
};
