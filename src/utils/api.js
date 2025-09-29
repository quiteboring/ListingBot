import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.hypixel.net/v2',
});

export const getUUIDFromIGN = async (ign) => {
  const { data } = await axios.get(
    `https://api.mojang.com/users/profiles/minecraft/${ign}`,
  );
  return data.id;
};

export const getProfileData = async (apiKey, uuid) => {
  const { data } = await api.get(
    `skyblock/profiles?key=${apiKey}&uuid=${uuid}`,
  );
  return data.profiles.find((p) => p.selected);
};

export const getMuseumData = async (apiKey, profileId, uuid) => {
  const { data } = await api.get(
    `skyblock/museum?key=${apiKey}&profile=${profileId}&uuid=${uuid}`,
  );
  return data;
};

export const getPlayerData = async (apiKey, uuid) => {
  const { data } = await api.get(`player?key=${apiKey}&uuid=${uuid}`);
  return data.player;
};
