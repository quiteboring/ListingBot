import { ChannelType, EmbedBuilder, MessageFlags } from 'discord.js';
import { errorEmbed } from './embed.js';
import colors from '../colors.js';
import { ProfileNetworthCalculator } from 'skyhelper-networth';
import {
  getUUIDFromIGN,
  getProfileData,
  getMuseumData,
  getPlayerData,
} from './api.js';

/**
 * @param {import("../bot/client.js").default} client
 * @param {import("discord.js").Interaction} interaction
 */
export const createAccountChannel = async (
  client,
  interaction,
  username,
  price,
) => {
  const setup = await client.db.get(`setup_${interaction.guild.id}`);
  const index =
    (await client.db.get(`listing_count_${interaction.guild.id}`)) ||
    1;

  const channelName = `💲${price}│listing-${index}`;
  const guild = interaction.guild;
  const category = guild.channels.cache.get(setup.listingsCategory);

  if (!category || category.type !== ChannelType.GuildCategory) {
    return interaction.reply({
      embeds: [errorEmbed('Invalid listings category configured.')],
      flags: MessageFlags.Ephemeral,
    });
  }

  const channel = await guild.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
    parent: category.id,
    permissionOverwrites: category.permissionOverwrites.cache.map(
      (po) => ({
        id: po.id,
        allow: po.allow.bitfield,
        deny: po.deny.bitfield,
      }),
    ),
  });
  await client.db.set(
    `listing_${interaction.guild.id}_${interaction.channel.id}`,
    { username, price },
  );

  await client.db.set(
    `listing_count_${interaction.guild.id}`,
    index + 1,
  );

  try {
    await interaction.deferUpdate();
    const uuid = await getUUIDFromIGN(username);
    const [profileData, playerData] = await Promise.all([
      getProfileData(client.hypixelApiKey, uuid),
      getPlayerData(client.hypixelApiKey, uuid),
    ]);

    const networthManager = new ProfileNetworthCalculator(
      profileData.members[uuid],
      await getMuseumData(
        client.hypixelApiKey,
        profileData.profile_id,
        uuid,
      ),
      profileData.banking?.balance ?? 0,
    );

    const networthData = await networthManager.getNetworth({
      onlyNetworth: true,
    });

    const member = profileData.members[uuid];

    const xp_tables = {
      skills: [
        50, 125, 200, 300, 500, 750, 1000, 1500, 2000, 3500, 5000, 7500,
        10000, 15000, 20000, 30000, 50000, 75000, 100000, 200000, 300000,
        400000, 500000, 600000, 700000, 800000, 900000, 1000000, 1100000,
        1200000, 1300000, 1400000, 1500000, 1600000, 1700000, 1800000,
        1900000, 2000000, 2100000, 2200000, 2300000, 2400000, 2500000,
        2600000, 2750000, 2900000, 3100000, 3400000, 3700000, 4000000,
        4300000, 4600000, 4900000, 5200000, 5500000, 5800000, 6100000,
        6400000, 6700000, 7000000,
      ],
      catacombs: [
        50, 75, 110, 160, 230, 330, 470, 670, 950, 1340, 1890, 2665, 3760,
        5260, 7380, 10300, 14400, 20000, 27600, 38000, 52500, 71500, 97000,
        132000, 180000, 243000, 328000, 445000, 600000, 800000, 1065000,
        1410000, 1900000, 2500000, 3300000, 4300000, 5600000, 7200000,
        9200000, 12000000, 15000000, 19000000, 24000000, 30000000,
        38000000, 48000000, 60000000, 75000000, 93000000, 116250000,
      ],
    };


    const getLevelFromXP = (skillExpRaw, type) => {
      const table = xp_tables[type];
      if (!table || table.length === 0) return 0;
      const skillExp = Number(skillExpRaw) || 0;

      let xpTotal = 0;
      let level = 0; 
      const maxLevel = table.length;

      for (let i = 0; i < maxLevel; i++) {
        const need = Number(table[i]) || 0;
        xpTotal += need;

        if (xpTotal > skillExp) {
          xpTotal -= need;
          const xpCurrent = Math.floor(skillExp - xpTotal);
          const xpForNext = need; 
          const progress = xpForNext > 0 ? Math.max(0, Math.min(xpCurrent / xpForNext, 1)) : 0;
          return level + progress; 
        } else {
        //  level = i + 1;
        }
      }

      return maxLevel;
    };

    const formatNumber = (num) => {
      if (num === null || num === undefined || !Number.isFinite(Number(num)))
        return '0';
      const n = Number(num);
      const abs = Math.abs(n);
      if (abs >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
      if (abs >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
      if (abs >= 1e3) return `${(n / 1e3).toFixed(2)}K`;
      return Number.isInteger(n) ? `${n}` : n.toFixed(2);
    };

    const skyblockLevel = member.leveling?.experience
      ? member.leveling.experience / 100
      : 0;

    const skills = {
      taming:
        getLevelFromXP(
          member.player_data?.experience?.SKILL_TAMING || 0,
          'skills',
        ) || 0,
      farming:
        getLevelFromXP(
          member.player_data?.experience?.SKILL_FARMING || 0,
          'skills',
        ) || 0,
      mining:
        getLevelFromXP(
          member.player_data?.experience?.SKILL_MINING || 0,
          'skills',
        ) || 0,
      combat:
        getLevelFromXP(
          member.player_data?.experience?.SKILL_COMBAT || 0,
          'skills',
        ) || 0,
      foraging:
        getLevelFromXP(
          member.player_data?.experience?.SKILL_FORAGING || 0,
          'skills',
        ) || 0,
      fishing:
        getLevelFromXP(
          member.player_data?.experience?.SKILL_FISHING || 0,
          'skills',
        ) || 0,
      enchanting:
        getLevelFromXP(
          member.player_data?.experience?.SKILL_ENCHANTING || 0,
          'skills',
        ) || 0,
      alchemy:
        getLevelFromXP(
          member.player_data?.experience?.SKILL_ALCHEMY || 0,
          'skills',
        ) || 0,
    };

    const skillAverage =
      Object.values(skills).reduce((a, b) => a + Number(b || 0), 0) /
      Object.keys(skills).length;

    const catacombsLevel =
      getLevelFromXP(
        member.dungeons?.dungeon_types?.catacombs?.experience || 0,
        'catacombs',
      ) || 0;

    const slayers = member.slayer_bosses || {};

    const findBossObject = (key) => {
      if (!slayers || typeof slayers !== 'object') return null;
      if (slayers[key] !== undefined) return slayers[key];
      const lower = key.toLowerCase();
      for (const k of Object.keys(slayers)) {
        if (k.toLowerCase() === lower) return slayers[k];
      }
      return null;
    };

    const getSlayerLevel = (boss) => {
      if (!boss) return 0;
      if (boss.level && boss.level.current !== undefined && boss.level.current !== null) {
        const num = Number(boss.level.current);
        return Number.isFinite(num) ? num : 0;
      }
      if (boss.claimed_levels && typeof boss.claimed_levels === 'object') {
        let highest = 0;
        for (const k of Object.keys(boss.claimed_levels)) {
          const m = k.match(/^level_(\d+)/i);
          if (m) {
            const n = Number(m[1]);
            if (Number.isFinite(n) && n > highest) highest = n;
          }
        }
        return highest;
      }
      return 0;
    };

    const slayerOrder = ['zombie', 'spider', 'wolf', 'enderman', 'blaze', 'vampire'];
    const slayerNums = [];
    for (const k of slayerOrder) {
      const obj = findBossObject(k);
      if (obj !== null) slayerNums.push(getSlayerLevel(obj));
    }
    const slayerString = slayerNums.length ? slayerNums.join('/') : '0/0/0/0/0';

    const hotm = member.mining_core;
    const mithrilPowder =
      (hotm?.powder_mithril || 0) + (hotm?.powder_spent_mithril || 0);
    const gemstonePowder =
      (hotm?.powder_gemstone || 0) + (hotm?.powder_spent_gemstone || 0);
    const glacitePowder =
      (hotm?.powder_glacite || 0) + (hotm?.powder_spent_glacite || 0);

    const ranks = {
      NON: 'non',
      VIP: 'vip',
      'VIP+': 'vip_plus',
      MVP: 'mvp',
      'MVP+': 'mvp_plus',
      'MVP++': 'mvp_plus_plus',
      YOUTUBER: 'youtube',
    };

    const resolveRankFromPlayer = (pd) => {
      if (!pd) return 'NONE';
      if (pd.rank && pd.rank !== 'NORMAL') return pd.rank;
      if (pd.monthlyPackageRank && pd.monthlyPackageRank !== 'NONE')
        return pd.monthlyPackageRank;
      if (pd.newPackageRank && pd.newPackageRank !== 'NONE')
        return pd.newPackageRank;
      if (pd.packageRank && pd.packageRank !== 'NONE') return pd.packageRank;
      return 'NONE';
    };

    const normalizeApiRank = (apiRank) => {
      if (!apiRank) return 'NONE';
      let r = String(apiRank).toUpperCase();
      r = r.replace(/_PLUS_PLUS$/i, '++').replace(/_PLUS$/i, '+');
      if (r === 'NORMAL' || r === 'NONE') return 'NONE';
      return r;
    };

    const rawRank = resolveRankFromPlayer(playerData);
    const normalizedRank = normalizeApiRank(rawRank);
    const emojiKey = ranks[normalizedRank] ?? 'non';
    const displayRankLabel =
      playerData?.prefix ?? `[${normalizedRank === 'NONE' ? 'Non' : normalizedRank}]`;

    const emojis =
      (await client.db.get(`emojis_${interaction.guild.id}`)) || {};

    const parseNetNum = (v) => {
      if (v === null || v === undefined) return 0;
      if (typeof v === 'number') return v;
      if (typeof v === 'string') {
        const s = v.trim().replace(/,/g, '');
        const m = s.match(/^([-+]?[0-9]*\.?[0-9]+)\s*([kKmMbB])?$/);
        if (!m) {
          const f = parseFloat(s);
          return Number.isFinite(f) ? f : 0;
        }
        const n = parseFloat(m[1]);
        const suffix = (m[2] || '').toUpperCase();
        if (suffix === 'K') return n * 1e3;
        if (suffix === 'M') return n * 1e6;
        if (suffix === 'B') return n * 1e9;
        return n;
      }
      if (typeof v === 'object') {
        if (v.value !== undefined) return parseNetNum(v.value);
        if (v.total !== undefined) return parseNetNum(v.total);
      }
      return 0;
    };

    const tryPaths = (obj, paths) => {
      for (const path of paths) {
        const parts = path.split('.');
        let cur = obj;
        let ok = true;
        for (const p of parts) {
          if (cur == null || cur[p] === undefined) {
            ok = false;
            break;
          }
          cur = cur[p];
        }
        if (ok) return cur;
      }
      return undefined;
    };

    const totalRaw = tryPaths(networthData, [
      'networth',
      'totalNetworth',
      'total',
      'networth.total',
      'value',
    ]);
    const unsoulRaw = tryPaths(networthData, [
      'unsoulboundNetworth',
      'unsoulbound',
      'unsoulbound_networth',
      'networth.unsoulbound',
      'components.unsoulbound',
    ]);
    const totalNum = parseNetNum(totalRaw !== undefined ? totalRaw : networthData);
    const unsoulNum = parseNetNum(unsoulRaw);

    let soulboundNum = Math.max(0, (totalNum || 0) - (unsoulNum || 0));

    if (!totalNum && networthData && typeof networthData === 'object') {
      const altTotal = tryPaths(networthData, ['networth.total', 'networth']);
      if (altTotal) {
        const altTotalNum = parseNetNum(altTotal);
        if (altTotalNum) {
          const altUnsoul = tryPaths(networthData, ['networth.unsoulbound', 'unsoulbound']);
          const altUnsoulNum = parseNetNum(altUnsoul);
          if (altUnsoulNum || altTotalNum) {
            const newTotal = altTotalNum || 0;
            const newUnsoul = altUnsoulNum || 0;
            soulboundNum = Math.max(0, newTotal - newUnsoul);
          }
        }
      }
    }

    const embed = new EmbedBuilder()
      .setTitle(`Account Information`)
      .setColor(colors.mainColor)
      .setThumbnail(`https://i.pinimg.com/736x/98/90/f5/9890f5e977325d33ad29cab66a5eb49e.jpg`)
      .addFields(
        {
          name: 'Rank',
          value: `${emojis[emojiKey]}`,
          inline: true,
        },
        {
          name: 'Skyblock Level',
          value: `${Number(skyblockLevel).toFixed(2)}`,
          inline: true,
        },
        {
          name: 'Skill Average',
          value: `${Number(skillAverage).toFixed(2)}`,
          inline: true,
        },
        {
          name: 'Catacombs Level',
          value: `${Number(catacombsLevel).toFixed(2)}`,
          inline: true,
        },
        {
          name: 'Slayers',
          value: `${slayerString}`,
          inline: true,
        },
        {
          name: 'Networth',
          value: `Total: ${formatNumber(totalNum)}\nUnsoulbound: ${formatNumber(unsoulNum)}\nSoulbound: ${formatNumber(soulboundNum)}`,
        },
        {
          name: 'HOTM',
          value: `Level: [not available](https://github.com/HypixelDev/PublicAPI/issues/685)\nMithril Powder: ${formatNumber(
            mithrilPowder,
          )}\nGemstone Powder: ${formatNumber(
            gemstonePowder,
          )}\nGlacite Powder: ${formatNumber(glacitePowder)}`,
        },
        {
          name: 'Price',
          value: `$${price}`,
          inline: true,
        },
      )
      .setFooter({
        text: `Listed by ${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    await channel.send({ embeds: [embed] });

  } catch (err) {
    console.log(err);
    return interaction.followUp({
      embeds: [errorEmbed('Unable to fetch specified IGN.')],
      flags: MessageFlags.Ephemeral,
    });
  }
};
