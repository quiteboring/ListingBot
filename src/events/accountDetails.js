import { MessageFlags } from 'discord.js';
import { errorEmbed } from '../utils/embeds.js';
import { getStatsBreakdown } from '../utils/listing/component.js';
import {
  generateDungeonsEmbed,
  generateFarmingEmbed,
  generateKuudraEmbed,
  generateNetworthEmbed,
  generateSkillsEmbed,
} from '../utils/listing/embed.js';

export default {
  name: 'interactionCreate',

  /**
   * @param {import("../bot/client").default} client
   * @param {import("discord.js").Interaction} interaction
   */
  async execute(client, interaction) {
    if (
      !interaction.isStringSelectMenu() ||
      !interaction.customId.startsWith('stats_breakdown')
    )
      return;

    const [, id] = interaction.customId.split(':');
    const msgId = id === '-1' ? interaction.message.id : id;
    const listings =
      (await client.db.get(`listings_${interaction.guild.id}`)) || [];

    const ign = listings.find(
      (item) =>
        item.channelId === interaction.channel.id &&
        item.messageId === msgId,
    );

    let embed = errorEmbed('Unable to find IGN stored in database.');

    if (!ign) {
      return await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
    }

    const option = interaction.values[0];
    const row = await getStatsBreakdown(client, msgId);

    switch (option) {
      case 'skills':
        embed = await generateSkillsEmbed(client, interaction, ign);
        break;
      case 'dungeons':
        embed = await generateDungeonsEmbed(client, interaction, ign);
        break;
      case 'kuudra':
        embed = await generateKuudraEmbed(client, interaction, ign);
        break;
      case 'farming':
        embed = await generateFarmingEmbed(client, interaction, ign);
        break;
      case 'networth':
        embed = await generateNetworthEmbed(client, interaction, ign);
        break;
    }

    return await interaction.reply({
      embeds: [embed],
      components: [row],
      flags: MessageFlags.Ephemeral,
    });
  },
};
