import fetch from 'node-fetch';

const cache = new Map();

export const getProfileData = async (apiKey, uuid) => {
  if (cache.has(uuid)) {
    const data = cache.get(uuid);

    if (data.last_save + 300000 > Date.now()) {
      return data.data;
    }
  }

  const response = await fetch(
    `https://api.hypixel.net/v2/skyblock/profiles?key=${apiKey}&uuid=${uuid}`,
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch profile data for ${uuid}. Status: ${response.status}`,
    );
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(`API error: ${data.cause}`);
  }

  if (!data.profiles || data.profiles.length === 0) {
    throw new Error(`No profiles found for ${uuid}`);
  }

  const selectedProfile = data.profiles.find(
    (profile) => profile.selected,
  );

  if (!selectedProfile) {
    throw new Error(`No selected profile found for ${uuid}`);
  }

  cache.set(uuid, { data: selectedProfile, last_save: Date.now() });
  return selectedProfile;
};
