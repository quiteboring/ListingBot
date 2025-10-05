import { MessageFlags, SlashCommandBuilder } from 'discord.js';
import { mainEmbed } from '../utils/embeds.js';

export default {
  data: new SlashCommandBuilder()
    .setName('value')
    .setDescription('Returns the value of an account!')
    .addStringOption((opt) =>
      opt.setName('username').setDescription('Use'),
    )
    .addBooleanOption((opt) =>
      opt
        .setName('lowball')
        .setDescription(
          'Returns a lowball value instead of original price if true',
        )
        .setRequired(false),
    ),

  /**
   * @param {import('../bot/client.js').default} client
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(client, interaction) {
    const username = interaction.options.getString('username');
    const lowball = interaction.options.getBoolean('lowball', false);

    await interaction.reply({
      embeds: [
        mainEmbed(
          `${lowball ? 'Lowball value' : 'Value'} of ${username}`,
        ),
      ],
      flags: MessageFlags.Ephemeral,
    });
  },
};
