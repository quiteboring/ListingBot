import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { isAdmin, isSeller } from '../utils/checks.js';
import { errorEmbed } from '../utils/embeds.js';

export default {
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription('Configure certain panels')
    .addSubcommand((sub) =>
      sub
        .setName('mfa')
        .setDescription('Configure MFA panel'),
    )
    .addSubcommand((sub) =>
      sub
        .setName('coin')
        .setDescription('Configure coin panel'),
    ),

  /**
   * @param {import('../bot/client.js').default} client
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(client, interaction) {
    if (!isAdmin(client, interaction.member)) {
      return await interaction.reply({
        embeds: [
          errorEmbed('Insufficient permissions to use this command.'),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    // TODO: finish command
  },
};
