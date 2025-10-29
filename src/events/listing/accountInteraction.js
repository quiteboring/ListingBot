import { MessageFlags } from 'discord.js';
import { errorEmbed } from '../../utils/embeds.js';
import { getStatsBreakdown } from '../../utils/listing/component.js';
import {
  generateDungeonsEmbed,
  generateFarmingEmbed,
  generateKuudraEmbed,
  generateNetworthEmbed,
  generateSkillsEmbed,
} from '../../utils/listing/embed.js';
import { getRank } from '../../api/functions/getRank.js';

export default {
  name: 'interactionCreate',

  /**
   * @param {import("../../bot/client.js").default} client
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
    const setup =
      (await client.db.get(`guild_${interaction.guild.id}`)) || {};
    const listings = setup?.listings || [];

    const data = listings.find(
      (item) =>
        item.channelId === interaction.channel.id &&
        item.messageId === msgId,
    );

    let embed = errorEmbed('Unable to find UUID stored in database.');

    if (!data) {
      return await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
    }

    const option = interaction.values[0];
    const row = await getStatsBreakdown(client, msgId);

    switch (option) {
      case 'skills':
        embed = await generateSkillsEmbed(
          client,
          interaction,
          data.uuid,
        );
        break;
      case 'dungeons':
        embed = await generateDungeonsEmbed(
          client,
          interaction,
          data.uuid,
        );
        break;
      case 'kuudra':
        embed = await generateKuudraEmbed(
          client,
          interaction,
          data.uuid,
        );
        break;
      case 'farming':
        embed = await generateFarmingEmbed(
          client,
          interaction,
          data.uuid,
        );
        break;
      case 'networth':
        embed = await generateNetworthEmbed(
          client,
          interaction,
          data.uuid,
        );
        break;
    }

    try {
      return await interaction.reply({
        embeds: [embed],
        components: [row],
        flags: MessageFlags.Ephemeral,
      });
    } catch (e) {}
  },
};
