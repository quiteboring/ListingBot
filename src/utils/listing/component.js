import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
} from 'discord.js';

export const getStatsBreakdown = async (client, msgId = -1) => {
  const emojis = (await client.db.get('emojis')) || {};

  const row = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`stats_breakdown:${msgId}`)
      .setPlaceholder('Click a stat to view it!')
      .addOptions(
        {
          label: 'Skills',
          description: 'View all skills and experience',
          emoji: emojis['foraging'],
          value: 'skills',
        },
        {
          label: 'Dungeons',
          description: 'View dungeon levels and skill experience',
          emoji: emojis['dungeon_skull'],
          value: 'dungeons',
        },
        {
          label: 'Kuudra',
          description: 'View kuudra progression and progression',
          emoji: emojis['kuudra'],
          value: 'kuudra',
        },
        {
          label: 'Farming',
          description:
            'View Jacob contest medals and garden plots unlocked',
          emoji: emojis['hoe'],
          value: 'farming',
        },
        {
          label: 'Networth',
          description:
            'View networth details like items and wardrobe',
          emoji: emojis['bank'],
          value: 'networth',
        },
      ),
  );

  return row;
};
