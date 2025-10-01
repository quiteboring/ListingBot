const formatNumber = (n, d = 1) => {
  if (!n || isNaN(n)) return '0';

  const u = ['', 'K', 'M', 'B', 'T', 'Q'];
  let i = 0;

  while (Math.abs(n) >= 1e3 && i < u.length - 1) {
    n /= 1e3;
    i++;
  }

  return `${n.toFixed(d)}${u[i]}`;
};

export const getSlayerData = (profile) => {
  const slayer = profile.me?.slayer;
  if (!slayer) return 'No Slayers';

  return ['zombie', 'spider', 'wolf', 'enderman', 'blaze', 'vampire']
    .map((type) => slayer[type]?.level ?? 0)
    .join('/');
};

export const getSkillAverage = (profile) => {
  return profile.me.skills.average.toFixed(2).toString();
};

export const getMinionData = (minions) => {
  if (!minions) return 'No Minion Data';

  const totalSlots = `**Total Slots:** ${minions.total}`;
  const craftedSlots = `**Crafted Slots:** ${minions.crafted} (**${minions.untilNext}** until next)`;
  const bonusSlots = `**Bonus Slots:** ${minions.community}`;

  return `${totalSlots}\n${craftedSlots}\n${bonusSlots}`;
};

export const getGardenData = (garden) => {
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

  return `**Level:** ${level}\n**MS Avg:** ${average}`;
};

export const getDungeonData = (profile) => {
  const dungeons = profile.me.dungeons;
  if (!dungeons) return 'No Dungeon Data';

  const catacombsLevel = dungeons.experience?.level ?? 0;
  const classLevels = Object.values(dungeons.classes).map(
    (cls) => cls.level ?? 0,
  );

  const classAverage = classLevels.length
    ? (
        classLevels.reduce((a, b) => a + b, 0) /
        (classLevels.length - 1)
      ).toFixed(2)
    : 0;

  return `**Catacombs:** ${catacombsLevel}\n**Class Avg:** ${classAverage}`;
};

export const getMiningData = (profile) => {
  const hotm = profile.me.hotm;
  if (!hotm) return 'No Mining Data';

  const level = hotm.experience.level ?? 0;
  const powder = hotm.powder ?? {};

  const mithril = formatNumber(powder.mithril?.total ?? 0);
  const gemstone = formatNumber(powder.gemstone?.total ?? 0);
  const glacite = formatNumber(powder.glacite?.total ?? 0);

  return `**HOTM Level:** ${level}\n**Mithril Powder:** ${mithril}\n**Gemstone Powder:** ${gemstone}\n**Glacite Powder:** ${glacite}`;
};

export const getSBLevel = (profile) => {
  return profile.me.level.toString();
};

export const getRank = (emojis, hyacc) => {
  function normalizeRank(rank) {
    if (!rank) return 'non';

    let formatted = rank.toLowerCase().replace(/\+/g, '_plus');

    if (formatted === 'default') {
      formatted = 'non';
    }

    return formatted;
  }

  return (
    emojis[normalizeRank(hyacc.rank) + '1'] +
    emojis[normalizeRank(hyacc.rank) + '2']
  );
};

export const getNetworthData = (nw) => {
  const networth = formatNumber(nw.networth);
  const unsoulboundNetworth = formatNumber(nw.unsoulboundNetworth);
  const coins = formatNumber(nw.purse + nw.bank);

  return `**Total:** ${networth}\n**Unsoulbound:** ${unsoulboundNetworth}\n**Coins:** ${coins}`;
};
