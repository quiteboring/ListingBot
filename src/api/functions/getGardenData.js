import fetch from 'node-fetch';

const cache = new Map();

export const getGardenData = async (apiKey, profileId) => {
  if (cache.has(profileId)) {
    const data = cache.get(profileId);

    if (data.last_save + 300000 > Date.now()) {
      return data.data;
    }
  }

  const response = await fetch(
    `https://api.hypixel.net/v2/skyblock/garden?key=${apiKey}&profile=${profileId}`,
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch garden data for profile ${profileId}. Status: ${response.status}`,
    );
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(`API error: ${data.cause}`);
  }

  cache.set(profileId, { data: data?.garden, last_save: Date.now() });
  return data?.garden;
};
