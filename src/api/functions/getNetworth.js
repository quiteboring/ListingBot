import { ProfileNetworthCalculator } from 'skyhelper-networth';

const cache = new Map();

export const getNetworth = async (profile, member, museum) => {
  if (cache.has(member.player_id)) {
    const data = cache.get(member.player_id);

    if (data.last_save + 300000 > Date.now()) {
      return data.data;
    }
  }

  const bankBalance = profile?.banking?.balance ?? 0;
  const networthManager = new ProfileNetworthCalculator(
    member,
    museum,
    bankBalance,
  );

  const nw = await networthManager.getNetworth();
  cache.set(member.player_id, { data: nw, last_save: Date.now() });
  return nw;
};
