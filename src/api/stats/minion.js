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
  if (!profile || !profile.members) {
    throw new Error('Invalid profile data: missing members.');
  }

  const uniqueMinionCount = Object.values(profile.members).reduce(
    (sum, member) =>
      sum + (member.player_data?.crafted_generators?.length ?? 0),
    0,
  );

  const threshold = thresholds
    .slice()
    .reverse()
    .find(([count]) => uniqueMinionCount >= count);

  if (!threshold) {
    throw new Error(
      'Could not determine minion slots from thresholds.',
    );
  }

  const slots = threshold[1];
  const currentIndex = thresholds.indexOf(threshold);
  const nextThreshold =
    currentIndex < thresholds.length - 1
      ? thresholds[currentIndex + 1][0]
      : null;

  if (!profile.community_upgrades?.upgrade_states) {
    throw new Error(
      'Invalid profile data: missing community upgrades.',
    );
  }

  const communitySlots =
    profile.community_upgrades.upgrade_states.filter(
      (upgrade) =>
        upgrade.upgrade === 'minion_slots' && upgrade.tier > 0,
    ).length;

  return {
    crafted: slots,
    community: communitySlots,
    total: slots + communitySlots,
    untilNext: nextThreshold ? nextThreshold - uniqueMinionCount : 0,
  };
};
