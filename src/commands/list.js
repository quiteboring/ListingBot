import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('list')
    .setDescription('List an account!'),

  /**
   * @param {import('../bot/client.js').default} client
   * @param {import('discord.js').Interaction} interaction
   */
  async execute(client, interaction) {
    await interaction.reply({
      content: 'placeholder',
    });
  },
};