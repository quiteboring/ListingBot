import { ChannelType, EmbedBuilder, MessageFlags } from 'discord.js';
import { ProfileNetworthCalculator } from 'skyhelper-networth';
import colors from '../colors.js';
import { errorEmbed } from './embed.js';
import {
  getMuseumData,
  getPlayerData,
  getProfileData,
  getUUIDFromIGN,
} from './api.js';

// --- Constants ---
const XP_TABLES = {
  skills: [
    50, 125, 200, 300, 500, 750, 1000, 1500, 2000, 3500, 5000, 7500, 10000,
    15000, 20000, 30000, 50000, 75000, 100000, 200000, 300000, 400000, 500000,
    600000, 700000, 800000, 900000, 1000000, 1100000, 1200000, 1300000, 1400000,
    1500000, 1600000, 1700000, 1800000, 1900000, 2000000, 2100000, 2200000,
    2300000, 2400000, 2500000, 2600000, 2750000, 2900000, 3100000, 3400000,
    3700000, 4000000, 4300000, 4600000, 4900000, 5200000, 5500000, 5800000,
    6100000, 6400000, 6700000, 7000000,
  ],
  catacombs: [
    50, 75, 110, 160, 230, 330, 470, 670, 950, 1340, 1890, 2665, 3760, 5260,
    7380, 10300, 14400, 20000, 27600, 38000, 52500, 71500, 97000, 132000,
    180000, 243000, 328000, 445000, 600000, 800000, 1065000, 1410000, 1900000,
    2500000, 3300000, 4300000, 5600000, 7200000, 9200000, 12000000, 15000000,
    19000000, 24000000, 30000000, 38000000, 48000000, 60000000, 75000000,
    93000000, 116250000,
  ],
};
const RANK_TO_EMOJI_KEY = {
  NON: 'non',
  VIP: 'vip',
  'VIP+': 'vip_plus',
  MVP: 'mvp',
  'MVP+': 'mvp_plus',
  'MVP++': 'mvp_plus_plus',
  YOUTUBER: 'youtube',
};
const SKILL_NAMES = [
  'taming', 'farming', 'mining', 'combat', 'foraging', 'fishing', 'enchanting', 'alchemy',
];
const SLAYER_ORDER = ['zombie', 'spider', 'wolf', 'enderman', 'blaze', 'vampire'];

const getNested = (obj, path) => {
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current?.[part] === undefined) return undefined;
    current = current[part];
  }
  return current;
};

const tryPaths = (obj, paths) => {
  for (const path of paths) {
    const value = getNested(obj, path);
    if (value !== undefined) return value;
  }
  return undefined;
};

const getLevelFromXp = (xp, type) => {
  const table = XP_TABLES[type];
  if (!table || typeof xp !== 'number' || !isFinite(xp)) return 0;

  let cumulativeXp = 0;
  for (let level = 0; level < table.length; level++) {
    const xpForNextLevel = table[level];
    if (xp < cumulativeXp + xpForNextLevel) {
      const xpIntoLevel = xp - cumulativeXp;
      const progress = xpIntoLevel / xpForNextLevel;
      return level + progress;
    }
    cumulativeXp += xpForNextLevel;
  }
  return table.length; // Max level
};

const formatNumber = (num) => {
  if (typeof num !== 'number' || !isFinite(num)) return '0';

  if (Math.abs(num) >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (Math.abs(num) >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (Math.abs(num) >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
  
  return Number.isInteger(num) ? String(num) : num.toFixed(2);
};

const parseNetworthNumber = (value) => {
  if (typeof value === 'number' && isFinite(value)) return value;
  if (value == null) return 0;

  if (typeof value === 'object') {
    return parseNetworthNumber(value.value ?? value.total);
  }

  if (typeof value === 'string') {
    const str = value.trim().replace(/,/g, '');
    const match = str.match(/^([-+]?[0-9]*\.?[0-9]+)\s*([kmb])?$/i);
    if (!match) return 0;

    const num = parseFloat(match[1]);
    const suffix = (match[2] || '').toUpperCase();

    if (suffix === 'K') return num * 1e3;
    if (suffix === 'M') return num * 1e6;
    if (suffix === 'B') return num * 1e9;
    return num;
  }

  return 0;
};

const findSlayerData = (slayers, key) => {
  if (!slayers) return null;
  const lowerKey = key.toLowerCase();
  const actualKey = Object.keys(slayers).find((k) => k.toLowerCase() === lowerKey);
  return actualKey ? slayers[actualKey] : null;
};

const getSlayerLevel = (bossData) => {
  if (!bossData) return 0;
  if (typeof bossData.level?.current === 'number') {
    return bossData.level.current;
  }
  if (bossData.claimed_levels) {
    return Object.keys(bossData.claimed_levels)
      .filter((key) => key.startsWith('level_'))
      .map((key) => parseInt(key.substring(6), 10))
      .reduce((max, level) => (level > max ? level : max), 0);
  }
  return 0;
};

const resolvePlayerRank = (playerData) => {
  if (!playerData) return 'NONE';
  return (
    playerData.rank ??
    playerData.monthlyPackageRank ??
    playerData.newPackageRank ??
    playerData.packageRank ??
    'NONE'
  ).replace('NORMAL', 'NONE');
};

const normalizeRank = (apiRank) => {
  if (!apiRank || apiRank === 'NONE') return 'NONE';
  return String(apiRank)
    .toUpperCase()
    .replace(/_PLUS_PLUS$/, '++')
    .replace(/_PLUS$/, '+');
};


/**
 * @param {import("../bot/client.js").default} client
 * @param {import("discord.js").Interaction} interaction
 */
export const createAccountChannel = async (client, interaction, username, price) => {
  const setup = await client.db.get(`setup_${interaction.guild.id}`);
  const listingIndex = (await client.db.get(`listing_count_${interaction.guild.id}`)) || 1;
  const category = interaction.guild.channels.cache.get(setup?.listingsCategory);

  if (!category || category.type !== ChannelType.GuildCategory) {
    return interaction.reply({
      embeds: [errorEmbed('Invalid listings category configured.')],
      flags: MessageFlags.Ephemeral,
    });
  }

  const channel = await interaction.guild.channels.create({
    name: `💲${price}│listing-${listingIndex}`,
    type: ChannelType.GuildText,
    parent: category.id,
    permissionOverwrites: category.permissionOverwrites.cache.map((po) => ({
      id: po.id,
      allow: po.allow.bitfield,
      deny: po.deny.bitfield,
    })),
  });

  await client.db.set(`listing_${interaction.guild.id}_${channel.id}`, { username, price });
  await client.db.set(`listing_count_${interaction.guild.id}`, listingIndex + 1);

  try {
    await interaction.deferUpdate();

    const uuid = await getUUIDFromIGN(username);
    const [profileData, playerData] = await Promise.all([
      getProfileData(client.hypixelApiKey, uuid),
      getPlayerData(client.hypixelApiKey, uuid),
    ]);
    const member = profileData.members[uuid];

    const skyblockLevel = (member.leveling?.experience ?? 0) / 100;
    const skills = Object.fromEntries(
      SKILL_NAMES.map((skill) => {
        const xp = member.player_data?.experience?.[`SKILL_${skill.toUpperCase()}`] ?? 0;
        return [skill, getLevelFromXp(xp, 'skills')];
      }),
    );
    const skillAverage = Object.values(skills).reduce((sum, level) => sum + level, 0) / SKILL_NAMES.length;
    const catacombsLevel = getLevelFromXp(member.dungeons?.dungeon_types?.catacombs?.experience ?? 0, 'catacombs');
    const slayerLevels = SLAYER_ORDER.map((slayerName) => {
      const bossData = findSlayerData(member.slayer_bosses, slayerName);
      return getSlayerLevel(bossData);
    });
    const slayerString = slayerLevels.join('/');
    const hotm = member.mining_core ?? {};
    const mithrilPowder = (hotm.powder_mithril ?? 0) + (hotm.powder_spent_mithril ?? 0);
    const gemstonePowder = (hotm.powder_gemstone ?? 0) + (hotm.powder_spent_gemstone ?? 0);
    const glacitePowder = (hotm.powder_glacite ?? 0) + (hotm.powder_spent_glacite ?? 0);
    const museumData = await getMuseumData(client.hypixelApiKey, profileData.profile_id, uuid);
    const networthCalculator = new ProfileNetworthCalculator(member, museumData, profileData.banking?.balance ?? 0);
    const networthData = await networthCalculator.getNetworth({ onlyNetworth: true });
    
    const rawTotal = tryPaths(networthData, ['networth', 'totalNetworth', 'total', 'networth.total', 'value']);
    const rawUnsoulbound = tryPaths(networthData, ['unsoulboundNetworth', 'unsoulbound', 'unsoulbound_networth', 'networth.unsoulbound', 'components.unsoulbound']);
    const totalNetworth = parseNetworthNumber(rawTotal ?? networthData);
    const unsoulboundNetworth = parseNetworthNumber(rawUnsoulbound);
    let soulboundNetworth = Math.max(0, totalNetworth - unsoulboundNetworth);

    if (totalNetworth === 0 && typeof networthData === 'object' && networthData !== null) {
      const fallbackTotal = parseNetworthNumber(tryPaths(networthData, ['networth.total', 'networth']));
      if (fallbackTotal > 0) {
        const fallbackUnsoulbound = parseNetworthNumber(tryPaths(networthData, ['networth.unsoulbound', 'unsoulbound']));
        soulboundNetworth = Math.max(0, fallbackTotal - fallbackUnsoulbound);
      }
    }

    const emojis = (await client.db.get(`emojis_${interaction.guild.id}`)) || {};
    const apiRank = resolvePlayerRank(playerData);
    const normalizedRank = normalizeRank(apiRank);
    const rankEmojiKey = RANK_TO_EMOJI_KEY[normalizedRank] ?? 'non';

    const embed = new EmbedBuilder()
      .setTitle('Account Information')
      .setColor(colors.mainColor)
      .setThumbnail(`https://i.pinimg.com/736x/98/90/f5/9890f5e977325d33ad29cab66a5eb49e.jpg`)
      .addFields(
        { name: 'Rank', value: emojis[rankEmojiKey] ?? normalizedRank, inline: true },
        { name: 'Skyblock Level', value: skyblockLevel.toFixed(2), inline: true },
        { name: 'Skill Average', value: skillAverage.toFixed(2), inline: true },
        { name: 'Catacombs Level', value: catacombsLevel.toFixed(2), inline: true },
        { name: 'Slayers', value: slayerString, inline: true },
        { name: 'Price', value: `$${price}`, inline: true },
        {
          name: 'Networth',
          value: `Total: ${formatNumber(totalNetworth)}\nUnsoulbound: ${formatNumber(
            unsoulboundNetworth,
          )}\nSoulbound: ${formatNumber(soulboundNetworth)}`,
        },
        {
          name: 'Heart of the Mountain',
          value: `Mithril Powder: ${formatNumber(mithrilPowder)}\nGemstone Powder: ${formatNumber(
            gemstonePowder,
          )}\nGlacite Powder: ${formatNumber(glacitePowder)}`,
        },
      )
      .setFooter({
        text: `Listed by ${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Failed to create account channel:', error);
    if (channel) await channel.delete().catch(() => {});
    await interaction.followUp({
      embeds: [errorEmbed('Could not fetch player data. The account may not exist or the Hypixel API may be down.')],
      flags: MessageFlags.Ephemeral,
    });
  }
};