import fetch from 'node-fetch';

// TODO: Implement caching

export async function getUUIDFromIGN(ign) {
  const res = await fetch(
    `https://api.mojang.com/users/profiles/minecraft/${ign}`,
  );
  if (!res.ok) throw new Error(`Player ${ign} not found`);
  const data = await res.json();
  return data.id;
}

export async function getProfileData(apiKey, uuid) {
  const res = await fetch(
    `https://api.hypixel.net/v2/skyblock/profiles?key=${apiKey}&uuid=${uuid}`,
  );
  const json = await res.json();

  if (!json.success) throw new Error('Failed to fetch profiles');

  return json.profiles.find((profile) => profile.selected) || null;
}

export async function getMuseumData(apiKey, profileId, uuid) {
  const res = await fetch(
    `https://api.hypixel.net/v2/skyblock/museum?key=${apiKey}&profile=${profileId}`,
  );
  const json = await res.json();
  return json.members[uuid];
}
