import fetch from 'node-fetch';

const cache = new Map();

export const getUUID = async (ign) => {
  if (cache.has(ign)) {
    const data = cache.get(ign);

    if (data.last_save + 300000 > Date.now()) {
      return data.data;
    }
  }

  const response = await fetch(
    `https://api.mojang.com/users/profiles/minecraft/${ign}`,
  );

  if (response.status === 204) {
    throw new Error(`No user with name ${ign} found`);
  }

  if (!response.ok) {
    throw new Error(
      `Failed to fetch UUID for ${ign}. Status: ${response.status}`,
    );
  }

  const data = await response.json();

  cache.set(ign, { data: data.id, last_save: Date.now() });
  return data.id;
};
