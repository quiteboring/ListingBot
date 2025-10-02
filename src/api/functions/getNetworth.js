import { ProfileNetworthCalculator } from 'skyhelper-networth';

export const getNetworth = async (profile, member, museum) => {
  const bankBalance = profile?.banking?.balance ?? 0;
  const networthManager = new ProfileNetworthCalculator(
    member,
    museum,
    bankBalance,
  );

  return await networthManager.getNetworth({ onlyNetworth: true });
};
