import fetch from 'node-fetch';

export const getUUID = async (ign) => {
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
  return data.id;
};
