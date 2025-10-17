import { EmbedBuilder } from 'discord.js';
import { getUUID } from '../../api/functions/getUUID.js';
import { getMuseumData } from '../../api/functions/getMuseumData.js';
import { getMinionData } from '../../api/stats/minion.js';
import { getMember } from '../../api/stats/member.js';
import { getNetworth } from '../../api/functions/getNetworth.js';
import { getGarden } from '../../api/stats/garden.js';
import { getProfileData } from '../../api/functions/getProfileData.js';
import { getGardenData } from '../../api/functions/getGardenData.js';
import { getSlayer } from '../../api/stats/slayer.js';
import { getMining } from '../../api/stats/mining.js';
import {
  getSkillAverage,
  getSkills,
} from '../../api/stats/skills.js';
import { getDungeons } from '../../api/stats/dungeons.js';
import { getSBLevel } from '../../api/stats/player.js';
import { formatNumber, titleCase } from '../format.js';
import { getRank } from '../../api/functions/getRank.js';
import colors from '../../colors.js';
import {
  getCrimsonIsle,
  getKuudra,
} from '../../api/stats/crimson.js';

const showEmoji = (emojis, name) => {
  return emojis[name] ? `${emojis[name]} ` : '';
};

export const generateMainEmbed = async (client, interaction, ign) => {
  const emojis = (await client.db.get('emojis')) || {};

  const uuid = await getUUID(ign);
  const rank = await getRank(client.hyApiKey, uuid);

  const profile = await getProfileData(client.hyApiKey, uuid);
  const gardenData = await getGardenData(
    client.hyApiKey,
    profile.profile_id,
  );

  const museumData = await getMuseumData(
    client.hyApiKey,
    profile.profile_id,
  );

  const garden = getGarden(gardenData);
  const minions = getMinionData(profile);

  const member = getMember(profile, uuid);
  const mining = getMining(member);
  const dungeons = getDungeons(member);
  const networth = await getNetworth(profile, member, museumData);

  const embed = new EmbedBuilder()
    .setTitle('Account Information')
    .setThumbnail(`https://mc-heads.net/body/anonymous/left`)
    .setFields([
      {
        name: 'Rank',
        value: rank,
        inline: false,
      },
      {
        name: `${showEmoji(emojis, 'sblevel')}SB Level`,
        value: getSBLevel(member).toString(),
        inline: true,
      },
      {
        name: `${showEmoji(emojis, 'foraging')}Skill Average`,
        value: getSkillAverage(member, profile).toString(),
        inline: true,
      },
      {
        name: `${showEmoji(emojis, 'maddox_batphone')}Slayer`,
        value: Object.values(getSlayer(member))
          .map((slayer) => slayer.level)
          .join('/'),
        inline: true,
      },
      {
        name: `${showEmoji(emojis, 'bank')}Networth`,
        value: (() => {
          if (!networth) return 'No Networth Data';
          const totalNetworth = (networth.networth ?? 0).toFixed(2);
          const unsoulboundNetworth = (
            networth.unsoulboundNetworth ?? 0
          ).toFixed(2);
          const coins = (
            (networth.purse ?? 0) + (networth.bank ?? 0)
          ).toFixed(2);
          return `**Total:** ${formatNumber(totalNetworth)}\n**Unsoulbound:** ${formatNumber(unsoulboundNetworth)}\n**Coins:** ${formatNumber(coins)}`;
        })(),
        inline: true,
      },
      {
        name: `${showEmoji(emojis, 'garden')}Garden`,
        value: (() => {
          if (!garden) return 'No Garden Data';
          const level = garden.level.level ?? 0;

          const milestoneLevels = Object.values(
            garden.cropMilestones ?? {},
          ).map((crop) => crop.level ?? 0);

          const average = milestoneLevels.length
            ? (
                milestoneLevels.reduce((sum, val) => sum + val, 0) /
                milestoneLevels.length
              ).toFixed(2)
            : '0';

          return `**Level:** ${level.toFixed(2)}\n**MS Avg:** ${average}`;
        })(),
        inline: true,
      },
      {
        name: `${showEmoji(emojis, 'dungeon_skull')}Dungeons`,
        value: `**Catacombs:** ${dungeons.dungeons.level.toFixed(2)}\n**Class Avg:** ${dungeons.classAverage.toFixed(2)}`,
        inline: true,
      },
      {
        name: `${showEmoji(emojis, 'mining')}Mining`,
        value: (() => {
          if (!mining) return 'No Mining Data';
          const level = mining.level?.level ?? 0;
          const powder = mining.powder ?? {};
          const mithril = powder.mithril?.total ?? 0;
          const gemstone = powder.gemstone?.total ?? 0;
          const glacite = powder.glacite?.total ?? 0;
          return `**HOTM Level:** ${level}\n**Mithril Powder:** ${formatNumber(mithril)}\n**Gemstone Powder:** ${formatNumber(gemstone)}\n**Glacite Powder:** ${formatNumber(glacite)}`;
        })(),
        inline: true,
      },
      {
        name: `${showEmoji(emojis, 'cobblestone_minion')}Minions`,
        value: minions
          ? `**Total Slots:** ${minions.total}\n**Crafted Slots:** ${minions.crafted} (**${minions.untilNext}** until next)\n**Bonus Slots:** ${minions.community}/5`
          : 'No Minion Data',
        inline: true,
      },
    ])
    .setColor(colors.mainColor)
    .setFooter({
      iconURL: interaction.member.displayAvatarURL(),
      text: `Listed by ${interaction.member.displayName}`,
    })
    .setTimestamp();

  return embed;
};

const baseStatEmbed = (title) => {
  return new EmbedBuilder()
    .setTitle(`Account Information - ${title}`)
    .setThumbnail(`https://mc-heads.net/avatar/anonymous`)
    .setColor(colors.mainColor)
    .setFooter({
      text: 'Made by Nathan | https://quiteboring.dev',
      iconURL: 'https://quiteboring.dev/pfp.jpg',
    });
};

export const generateSkillsEmbed = async (
  client,
  interaction,
  ign,
) => {
  const emojis = (await client.db.get('emojis')) || {};

  const uuid = await getUUID(ign);
  const profile = await getProfileData(client.hyApiKey, uuid);
  const member = getMember(profile, uuid);
  const skills = getSkills(member, profile);

  const showEmoji = (name) => {
    return emojis[name] ? `${emojis[name]} ` : '';
  };

  const embed = baseStatEmbed('Skills');

  for (const [name, data] of Object.entries(skills)) {
    embed.addFields([
      {
        name: `${showEmoji(name)}${name.charAt(0).toUpperCase() + name.slice(1)} ${data['level']}`,
        value: formatNumber(data['xp']),
        inline: true,
      },
    ]);
  }

  return embed;
};

export const generateDungeonsEmbed = async (
  client,
  interaction,
  ign,
) => {
  const emojis = (await client.db.get('emojis')) || {};

  const showEmoji = (name) => {
    return emojis[name] ? `${emojis[name]} ` : '';
  };

  const embed = baseStatEmbed('Dungeons');

  const uuid = await getUUID(ign);
  const profile = await getProfileData(client.hyApiKey, uuid);
  const member = getMember(profile, uuid);
  const data = getDungeons(member);

  embed.addFields([
    {
      name: `${showEmoji('dungeon_skull')}Catacombs`,
      value: `**Level:** ${data.dungeons.levelWithProgress.toFixed(2)}\n**XP:** ${formatNumber(data.dungeons.xp, 2)}\n**Class Avg:** ${formatNumber(data.classAverage, 2)}`,
    },
  ]);

  for (const [className, classData] of Object.entries(data.classes)) {
    embed.addFields([
      {
        name: `${showEmoji(className)}${className.charAt(0).toUpperCase() + className.slice(1)}`,
        value: `**Level:** ${classData.levelWithProgress.toFixed(2)}\n**XP:** ${formatNumber(classData.xp, 2)}`,
        inline: true,
      },
    ]);
  }

  return embed;
};

export const generateKuudraEmbed = async (
  client,
  interaction,
  ign,
) => {
  const emojis = (await client.db.get('emojis')) || {};

  const showEmoji = (name) => {
    return emojis[name] ? `${emojis[name]} ` : '';
  };

  const embed = baseStatEmbed('Kuudra');

  const uuid = await getUUID(ign);
  const profile = await getProfileData(client.hyApiKey, uuid);
  const member = getMember(profile, uuid);

  const isle = getCrimsonIsle(member);
  const data = getKuudra(member);

  embed.setDescription(
    `Faction: **${isle?.faction || 'None'}**\n${showEmoji('barbarian')}Barbarian Rep: **${formatNumber(isle?.reputation.barbarian, 2) ?? 0}**\n${showEmoji('mage_faction')}Mage Rep: **${formatNumber(isle?.reputation.mage, 2) ?? 0}**`,
  );

  let kuudraValue = '';

  for (const [tier, count] of Object.entries(data)) {
    kuudraValue += `${showEmoji(tier)}${titleCase(tier)}: **${count ?? 0}**\n`;
  }

  embed.addFields([
    {
      name: `Kuudra Completions`,
      value: kuudraValue,
    },
  ]);

  return embed;
};

export const generateFarmingEmbed = async (
  client,
  interaction,
  ign,
) => {
  const emojis = (await client.db.get('emojis')) || {};

  const embed = baseStatEmbed('Farming');

  const uuid = await getUUID(ign);
  const profile = await getProfileData(client.hyApiKey, uuid);
  const gardenData = await getGardenData(
    client.hyApiKey,
    profile.profile_id,
  );
  const garden = getGarden(gardenData);

  embed.setDescription(
    `Garden Level: **${garden.level.unlockableLevelWithProgress.toFixed(2)}** (**${formatNumber(garden.level.xp, 2)}** XP)\nVisitors Served: **${gardenData?.commission_data?.total_completed ?? 0}**\nUnique Visitors: **${gardenData?.commission_data?.unique_npcs_served ?? 0}**`,
  );

  if (garden.unlockedPlots) {
    const cactusGreen = emojis['cactus_green'] || '🟩';
    const redDye = emojis['rose_dye'] || '🟥';
    const bedrock = emojis['bedrock'] || '⬛';

    const grid = garden.unlockedPlots
      .map((row, y) =>
        row
          .map((cell, x) => {
            if (cell === 'center') return bedrock;
            return cell === 'unlocked' ? cactusGreen : redDye;
          })
          .join(' '),
      )
      .join('\n');

    embed.addFields({
      name: 'Unlocked Plots',
      value: grid,
      inline: false,
    });
  }
  return embed;
};

export const generateNetworthEmbed = async (
  client,
  interaction,
  ign,
) => {
  const emojis = (await client.db.get('emojis')) || {};

  const embed = baseStatEmbed('Networth');

  const uuid = await getUUID(ign);
  const profile = await getProfileData(client.hyApiKey, uuid);
  const museumData = await getMuseumData(
    client.hyApiKey,
    profile.profile_id,
  );

  const member = getMember(profile, uuid);
  const networth = await getNetworth(profile, member, museumData);

  if (!networth || !networth.types) {
    embed.setDescription('No Networth Data');
    return embed;
  }

  if (networth) {
    embed.setDescription(
      `**Total Networth:** ${formatNumber(networth.networth ?? 0)}\n**Unsoulbound Networth:** ${formatNumber(networth.unsoulboundNetworth ?? 0)}`,
    );

    embed.addFields([
      {
        name: `${showEmoji(emojis, 'gold')}Purse`,
        value: formatNumber(networth.purse ?? 0),
        inline: true,
      },
      {
        name: `${showEmoji(emojis, 'bank')}Bank`,
        value: formatNumber(networth.bank ?? 0),
        inline: true,
      },
      {
        name: `${showEmoji(emojis, 'essence')}Essence`,
        value: formatNumber(networth.types.essence?.total ?? 0),
        inline: true,
      },
    ]);
  }

  function getTopItems(items) {
    if (!Array.isArray(items) || items.length === 0)
      return 'No items found';
    return items
      .filter(
        (i) =>
          typeof i === 'object' &&
          i !== null &&
          typeof i.price === 'number',
      )
      .sort((a, b) => b.price - a.price)
      .slice(0, 5)
      .map(
        (item) =>
          `${item.name ? item.name : 'Unknown'} (**${formatNumber(item.price)}**)`,
      )
      .join('\n');
  }

  if (networth.types.armor) {
    embed.addFields({
      name: `${showEmoji(emojis, 'tank')}Armor (${formatNumber(networth.types.armor.total ?? 0)})`,
      value: getTopItems(networth.types.armor.items),
      inline: false,
    });
  }

  function getAllItems(types, keys) {
    let items = [];

    for (const key of keys) {
      if (types[key] && Array.isArray(types[key].items)) {
        items = items.concat(types[key].items);
      }
    }
    return items;
  }

  if (networth.types) {
    const allItemKeys = [
      'inventory',
      'enderchest',
      'wardrobe',
      'storage',
      'equipment',
      'personal_vault',
      'fishing_bag',
      'potion_bag',
      'sacks_bag',
      'sacks',
    ];

    const allItems = getAllItems(networth.types, allItemKeys);

    embed.addFields({
      name: `${showEmoji(emojis, 'berserk')}Items (${formatNumber(allItems.reduce((sum, item) => sum + (item.price || 0), 0))})`,
      value: getTopItems(allItems),
      inline: false,
    });
  }

  if (networth.types.pets) {
    embed.addFields({
      name: `${showEmoji(emojis, 'taming')}Pets (${formatNumber(networth.types.pets.total ?? 0)})`,
      value: getTopItems(networth.types.pets.items),
      inline: false,
    });
  }

  if (networth.types.accessories) {
    embed.addFields({
      name: `${showEmoji(emojis, 'accessories')}Accessories (${formatNumber(networth.types.accessories.total ?? 0)})`,
      value: getTopItems(networth.types.accessories.items),
      inline: false,
    });
  }

  return embed;
};
