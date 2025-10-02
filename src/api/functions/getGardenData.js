import fetch from 'node-fetch';

export const getGardenData = async (apiKey, profileId) => {
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

  return data?.garden;
};
