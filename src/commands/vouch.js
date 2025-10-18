import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('vouch')
    .setDescription('TODO!'),

  /**
   * @param {import('../bot/client.js').default} client
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(client, interaction) {
    // TODO: Implement vouch command
  },
};
