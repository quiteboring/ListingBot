import { getLevelByXp } from '../constants/skills.js';

export const getGarden = (garden) => {
  try {
    if (!garden) {
      return null;
    }

    const unlockedIds = garden.unlocked_plots_ids || [];
    const plotOrder = [
      [
        'expert_1',
        'advanced_1',
        'advanced_6',
        'advanced_8',
        'expert_3',
      ],
      [
        'advanced_2',
        'beginner_1',
        'intermediate_1',
        'beginner_4',
        'advanced_10',
      ],
      [
        'advanced_3',
        'intermediate_2',
        null,
        'intermediate_3',
        'advanced_11',
      ],
      [
        'advanced_5',
        'beginner_3',
        'intermediate_4',
        'beginner_2',
        'advanced_12',
      ],
      [
        'expert_2',
        'advanced_7',
        'advanced_9',
        'advanced_4',
        'expert_4',
      ],
    ];

    const unlockedPlots = plotOrder.map((row) =>
      row.map((plotId) =>
        plotId === null
          ? 'center'
          : unlockedIds.includes(plotId)
            ? 'unlocked'
            : 'locked',
      ),
    );

    return {
      level: getLevelByXp(garden.garden_experience),

      cropMilestones: {
        wheat: getLevelByXp(garden.resources_collected?.WHEAT, {
          type: 'garden',
        }),
        carrot: getLevelByXp(
          garden.resources_collected?.CARROT_ITEM,
          { type: 'CARROT_ITEM' },
        ),
        sugarCane: getLevelByXp(
          garden.resources_collected?.SUGAR_CANE,
          { type: 'SUGAR_CANE' },
        ),
        potato: getLevelByXp(
          garden.resources_collected?.POTATO_ITEM,
          { type: 'POTATO_ITEM' },
        ),
        netherWart: getLevelByXp(
          garden.resources_collected?.NETHER_STALK,
          { type: 'NETHER_STALK' },
        ),
        pumpkin: getLevelByXp(garden.resources_collected?.PUMPKIN, {
          type: 'PUMPKIN',
        }),
        melon: getLevelByXp(garden.resources_collected?.MELON, {
          type: 'MELON',
        }),
        mushroom: getLevelByXp(
          garden.resources_collected?.MUSHROOM_COLLECTION,
          { type: 'MUSHROOM_COLLECTION' },
        ),
        cocoaBeans: getLevelByXp(
          garden.resources_collected?.['INK_SACK:3'],
          { type: 'INK_SACK:3' },
        ),
        cactus: getLevelByXp(garden.resources_collected?.CACTUS, {
          type: 'CACTUS',
        }),
      },
      unlockedPlots,
    };
  } catch (error) {
    console.log(error);
    return null;
  }
};
