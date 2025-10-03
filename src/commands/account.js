import { MessageFlags, SlashCommandBuilder } from 'discord.js';
import { errorEmbed } from '../utils/embeds.js';
import { generateMainEmbed } from '../utils/listing/embed.js';

export default {
  data: new SlashCommandBuilder()
    .setName('account')
    .setDescription('View account details!'),

  /**
   * @param {import('../bot/client.js').default} client
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(client, interaction) {
    try {
      const ign = '56ms';
      const embed = await generateMainEmbed(client, interaction, ign);

      await interaction.reply({
        embeds: [embed],
      });
    } catch (err) {
      await interaction.reply({
        embeds: [errorEmbed('Error: ' + err)],
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
