import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Pong!'),

  /**
   * @param {import('../bot/client.js').default} client
   * @param {import('discord.js').Interaction} interaction
   */
  async execute(client, interaction) {
    await interaction.reply({
      content: 'Pong!',
    });
  },
};
