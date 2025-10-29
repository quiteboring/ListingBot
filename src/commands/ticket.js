import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Command for adjusting a ticket.')
    .addSubcommand((sub) =>
      sub
        .setName('close')
        .setDescription(
          'Close current channel which must be a ticket.',
        ),
    ),

  /**
   * @param {import('../bot/client.js').default} client
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(client, interaction) {
    const sub = interaction.options.getSubcommand();

    switch (sub) {
      case 'close':
        return await this.handleCloseTicket(client, interaction);
    }
  },

  async handleCloseTicket() {},
};
