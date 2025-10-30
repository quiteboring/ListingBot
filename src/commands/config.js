import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { isAdmin, isSeller } from '../utils/checks.js';
import { errorEmbed, successEmbed } from '../utils/embeds.js';

export default {
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription('Configure certain panels')
    .addSubcommand((sub) =>
      sub
        .setName('apikey')
        .setDescription('Update bot api key for those without perm API key (owner only).')
        .addStringOption((opt) => opt.setName('key').setDescription('A working Hypixel API key.')),
    )
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

    const sub = interaction.options.getSubcommand();

    switch (sub) {
      case 'apikey':
        if (interaction.user.id != client.ownerId) {
          return await interaction.reply({
            embeds: [errorEmbed('This is an owner only command.')],
            flags: MessageFlags.Ephemeral
          })
        }

        const key = interaction.options.getString('key');
        client.hyApiKey = key;

        return await interaction.reply({
          embeds: [successEmbed(`Updated Hypixel API Key to ${key}`)],
          flags: MessageFlags.Ephemeral
        })
      default:
        return await interaction.reply({
          embeds: [errorEmbed('Not implemented subcommand :(')],
          flags: MessageFlags.Ephemeral
        })
    }
  },
};
