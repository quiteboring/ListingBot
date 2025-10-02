import { cropTables, skillTables } from './leveling.js';

const getXpTable = (type = 'default') => {
  return cropTables[type] ?? skillTables[type] ?? skillTables.default;
};

export const getLevelByXp = (xp, extra = {}) => {
  const xpTable = getXpTable(extra.type);

  if (typeof xp !== 'number' || isNaN(xp)) {
    xp = 0;
  }

  const levelCap =
    extra.cap ??
    skillTables.defaultSkillCaps[extra.type] ??
    Math.max(...Object.keys(xpTable).map(Number));

  let uncappedLevel = 0;
  let xpCurrent = xp;
  let xpRemaining = xp;

  while (xpTable[uncappedLevel + 1] <= xpRemaining) {
    uncappedLevel++;
    xpRemaining -= xpTable[uncappedLevel];
    if (uncappedLevel <= levelCap) {
      xpCurrent = xpRemaining;
    }
  }

  const isInfiniteLevelable = skillTables.infiniteLeveling.includes(
    extra.type,
  );

  if (isInfiniteLevelable) {
    const maxExperience = Object.values(xpTable).at(-1);
    uncappedLevel += Math.floor(xpRemaining / maxExperience);
    xpRemaining %= maxExperience;
    xpCurrent = xpRemaining;
  }

  const maxLevel = isInfiniteLevelable
    ? Math.max(uncappedLevel, levelCap)
    : (skillTables.maxedSkillCaps[extra.type] ?? levelCap);

  const level = isInfiniteLevelable
    ? uncappedLevel
    : Math.min(levelCap, uncappedLevel);

  const xpForNext =
    level < maxLevel
      ? Math.ceil(xpTable[level + 1] ?? Object.values(xpTable).at(-1))
      : isInfiniteLevelable
        ? Object.values(xpTable).at(-1)
        : Infinity;

  const progress =
    level >= maxLevel && !isInfiniteLevelable
      ? 0
      : Math.max(0, Math.min(xpCurrent / xpForNext, 1));

  const levelWithProgress = isInfiniteLevelable
    ? uncappedLevel + progress
    : Math.min(uncappedLevel + progress, levelCap);

  const unlockableLevelWithProgress = extra.cap
    ? Math.min(uncappedLevel + progress, maxLevel)
    : levelWithProgress;

  const maxExperience = getSkillExperience(extra.type, levelCap);

  return {
    xp,
    level,
    maxLevel,
    xpCurrent,
    xpForNext,
    progress,
    levelCap,
    uncappedLevel,
    levelWithProgress,
    unlockableLevelWithProgress,
    maxExperience,
  };
};

export const getSkillExperience = (skill, level) => {
  const skillTable = getXpTable(skill);
  return Object.entries(skillTable).reduce(
    (acc, [key, value]) => (key <= level ? acc + value : acc),
    0,
  );
};

export const getSkillLevelCaps = (profileData, hypixelPlayer) => {
  return {
    farming:
      50 +
      (profileData.jacobs_contest?.perks?.farming_level_cap || 0),
    taming:
      50 +
      (profileData.pets_data?.pet_care?.pet_types_sacrificed
        ?.length || 0),
    runecrafting: 25,
  };
};

export const getSocialSkillExperience = (profile) => {
  return Object.keys(profile.members).reduce((acc, member) => {
    return (
      acc +
      (profile.members[member]?.player_data?.experience
        ?.SKILL_SOCIAL || 0)
    );
  }, 0);
};
