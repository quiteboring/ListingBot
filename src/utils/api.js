import axios from 'axios';
import { ProfileNetworthCalculator } from 'skyhelper-networth';

const api = axios.create({ baseURL: 'https://api.hypixel.net/v2' });

export const getNetworth = async (apiKey, ign) => {
  const { data: { id: uuid } } = await axios.get(`https://api.mojang.com/users/profiles/minecraft/${ign}`);
  const { data: { profiles } } = await api.get(`skyblock/profiles?key=${apiKey}&uuid=${uuid}`);
  
  const profile = profiles.find(p => p.selected);

  const { data: museumData } = await api.get(`skyblock/museum?key=${apiKey}&profile=${profile.profile_id}&uuid=${uuid}`);

  const networthCalc = new ProfileNetworthCalculator(
    profile.members[uuid],
    museumData,
    profile.banking?.balance ?? 0
  );

  return await networthCalc.getNetworth({ onlyNetworth: true });
};
