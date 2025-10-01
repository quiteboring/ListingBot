import axios from 'axios';

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

  const minionData = await getMinionData(apiKey, ign);

  const data = {
    profile: prof,
    networth: await prof.me.getNetworth({ onlyNetworth: true }),
    hyacc: await client.api.getPlayer(ign),
    garden: await client.api.getSkyblockGarden(prof.profileId),
    minions: minionData,
  };

  cache.set(ign, { data, timestamp: now });
  return data;
};

const getMinionData = async (apiKey, ign) => {
  try {
    const { data } = await axios.get(
      `https://api.mojang.com/users/profiles/minecraft/${ign}`,
    );

    const res = await axios.get(
      `https://api.hypixel.net/v2/skyblock/profiles?key=${apiKey}&uuid=${data.id}`,
    );

    const profile =
      res.data.profiles?.find((p) => p.selected) ||
      res.data.profiles?.[0];

    if (!profile) return console.log('No profiles found.');

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

    const uniqueMinionCount = Object.values(profile.members).reduce(
      (sum, m) =>
        sum + (m.player_data?.crafted_generators?.length - 1 ?? 0),
      0,
    );

    let slots = 5,
      nextThreshold = null;
    for (let i = thresholds.length - 1; i >= 0; i--) {
      if (uniqueMinionCount >= thresholds[i][0]) {
        slots = thresholds[i][1];
        nextThreshold =
          i < thresholds.length - 1 ? thresholds[i + 1][0] : null;
        break;
      }
    }

    const communitySlots = Object.values(
      profile.community_upgrades.upgrade_states,
    ).filter((s) => s.upgrade === 'minion_slots').length;

    return {
      crafted: slots,
      community: communitySlots,
      total: slots + communitySlots,
      untilNext: nextThreshold
        ? nextThreshold - uniqueMinionCount
        : 0,
    };
  } catch (err) {
    return null;
  }
};
