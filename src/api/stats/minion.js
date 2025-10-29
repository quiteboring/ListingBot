const thresholds = [
  [0, 5],
  [5, 6],
  [15, 7],
  [30, 8],
  [50, 9],
  [75, 10],
  [100, 11],
  [125, 12],
  [150, 13],
  [175, 14],
  [200, 15],
  [225, 16],
  [250, 17],
  [275, 18],
  [300, 19],
  [350, 20],
  [400, 21],
  [450, 22],
  [500, 23],
  [550, 24],
  [600, 25],
  [650, 26],
  [700, 27],
];

export const getMinionData = (profile) => {
  if (!profile || !profile?.members) {
    throw new Error('Invalid profile data: missing members.');
  }

  const members = Object.values(profile.members);
  let uniqueMinionCount = 0;

  for (const member of members) {
    if (
      member &&
      member.player_data &&
      Array.isArray(member.player_data.crafted_generators)
    ) {
      uniqueMinionCount +=
        member.player_data.crafted_generators.length;
    }
  }

  let threshold =
    thresholds
      .slice()
      .reverse()
      .find(([count]) => uniqueMinionCount >= count) ?? thresholds[0];

  const slots = threshold[1];
  const currentIndex = thresholds.indexOf(threshold);
  const nextThreshold =
    currentIndex < thresholds.length - 1
      ? thresholds[currentIndex + 1][0]
      : null;

  const communitySlots =
    profile?.community_upgrades?.upgrade_states?.filter(
      (upgrade) =>
        upgrade.upgrade === 'minion_slots' && upgrade.tier > 0,
    ).length ?? 0;

  return {
    crafted: slots,
    community: communitySlots,
    total: slots + communitySlots,
    untilNext: nextThreshold ? nextThreshold - uniqueMinionCount : 0,
  };
};
