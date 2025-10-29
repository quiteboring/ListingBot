import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { isSeller } from '../utils/checks.js';
import { errorEmbed } from '../utils/embeds.js';

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
    if (!(await isSeller(client, interaction.member))) {
      return await interaction.reply({
        embeds: [
          errorEmbed('Insufficient permissions to use this command.'),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
    
    const sub = interaction.options.getSubcommand();

    switch (sub) {
      case 'close':
        return await this.handleCloseTicket(client, interaction);
    }
  },

  async handleCloseTicket() {
    
  },
};
