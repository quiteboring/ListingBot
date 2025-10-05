import { MessageFlags, SlashCommandBuilder } from 'discord.js';
import { errorEmbed } from '../utils/embeds.js';
import { generateMainEmbed } from '../utils/listing/embed.js';
import { getStatsBreakdown } from '../utils/listing/component.js';

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

      const listings =
        (await client.db.get(`listings_${interaction.guild.id}`)) ||
        [];

      const embed = await generateMainEmbed(client, interaction, ign);
      const row = await getStatsBreakdown(client);

      await interaction.reply({
        embeds: [embed],
        components: [row],
        withResponse: true,
      });

      const msg = await interaction.fetchReply();

      listings.push({
        messageId: msg.id,
        channelId: interaction.channel.id,
        ign: ign,
      });

      await client.db.set(
        `listings_${interaction.guild.id}`,
        listings,
      );
    } catch (err) {
      console.log(err);

      await interaction.reply({
        embeds: [errorEmbed('Error: ' + err)],
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
