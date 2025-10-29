import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('customer')
    .setDescription('Manage customers in your server')
    .addSubcommand((sub) =>
      sub
        .setName('add')
        .setDescription(
          'Allow sellers to add give a user a customer role',
        ),
    ),

  /**
   * @param {import('../bot/client.js').default} client
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(client, interaction) {
    const sub = interaction.options.getSubcommand();

    switch (sub) {
      case 'add':
        return await this.handleAddCustomer(client, interaction);
    }
  },

  async handleAddCustomer() {},
};
