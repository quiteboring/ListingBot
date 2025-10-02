import { getLevelByXp } from '../constants/skills.js';

export const getMining = (profile) => {
  try {
    if (!profile?.mining_core) {
      return null;
    }

    return {
      powder: {
        mithril: {
          spent: profile.mining_core.powder_spent_mithril ?? 0,
          current: profile.mining_core.powder_mithril ?? 0,
          total:
            (profile.mining_core.powder_spent_mithril ?? 0) +
            (profile.mining_core.powder_mithril ?? 0),
        },
        gemstone: {
          spent: profile.mining_core.powder_spent_gemstone ?? 0,
          current: profile.mining_core.powder_gemstone ?? 0,
          total:
            (profile.mining_core.powder_spent_gemstone ?? 0) +
            (profile.mining_core.powder_gemstone ?? 0),
        },
        glacite: {
          spent: profile.mining_core.powder_spent_glacite ?? 0,
          current: profile.mining_core.powder_glacite ?? 0,
          total:
            (profile.mining_core.powder_spent_glacite ?? 0) +
            (profile.mining_core.powder_glacite ?? 0),
        },
      },
      level: getLevelByXp(profile.mining_core.experience, {
        type: 'hotm',
      }),
    };
  } catch (error) {
    throw new Error('Cannot find mining data.');
  }
};
