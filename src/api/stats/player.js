export const getSBLevel = (profile) => {
  return profile?.leveling?.experience / 100 ?? 0;
};
