import { skillTables } from '../constants/leveling.js';
import {
  getLevelByXp,
  getSkillLevelCaps,
  getSocialSkillExperience,
} from '../constants/skills.js';

export const getSkills = (profile, profileData) => {
  if (profile.player_data?.experience === undefined) {
    throw new Error('No experience found in player data?');
  }

  const skillLevelCaps = getSkillLevelCaps(profile, null);
  const totalSocialXp = getSocialSkillExperience(profileData);
  const skills = {};

  for (const skill in profile.player_data?.experience || {}) {
    if (skill === 'SKILL_DUNGEONEERING') {
      continue;
    }

    const xp =
      skill === 'SKILL_SOCIAL'
        ? totalSocialXp
        : profile.player_data?.experience[skill];
    const type = skill.split('_').at(1)?.toLowerCase();
    skills[type] = getLevelByXp(xp, {
      type: type,
      cap: skillLevelCaps[type],
    });
  }

  return skills;
};

export const getSkillAverage = (
  profileData,
  hypixelPlayer,
  options = { decimals: 2, progress: false, cosmetic: false },
) => {
  const skillLevelCaps = getSkillLevelCaps(
    profileData,
    hypixelPlayer,
  );
  let totalLevel = 0;

  for (const skillId of skillTables.skills) {
    if (
      !options.cosmetic &&
      skillTables.cosmeticSkills.includes(skillId)
    ) {
      continue;
    }

    const skill = getLevelByXp(
      profileData.player_data?.experience?.[
        `SKILL_${skillId.toUpperCase()}`
      ],
      {
        type: skillId,
        cap: skillLevelCaps[skillId],
      },
    );

    totalLevel += options.progress
      ? skill.levelWithProgress
      : skill.level;
  }

  const average =
    totalLevel /
    skillTables.skills.filter(
      (skill) =>
        !(
          !options.cosmetic &&
          skillTables.cosmeticSkills.includes(skill)
        ),
    ).length;
  return average.toFixed(options.decimals);
};
