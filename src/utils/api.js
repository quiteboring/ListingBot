const cache = new Map();
const CACHE_TTL = 30 * 1000;

/**
 * Fetches SkyBlock data with caching.
 *
 * @param {import("../bot/client.js").default} client
 * @param {string} apiKey
 * @param {string} ign
 */
export const getData = async (client, apiKey, ign) => {
  const now = Date.now();
  const cached = cache.get(ign);

  if (cache.has(ign) && now - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const profs = await client.api.getSkyblockProfiles(ign);
  const prof = profs.find((p) => p.selected);

  const data = {
    profile: prof,
    networth: await prof.me.getNetworth({ onlyNetworth: true }),
    hyacc: await client.api.getPlayer(ign),
    garden: await client.api.getSkyblockGarden(prof.profileId),
  };

  cache.set(ign, { data, timestamp: now });
  return data;
};
