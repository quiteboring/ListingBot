import fetch from 'node-fetch';

export const getMuseumData = async (apiKey, profileId) => {
  const response = await fetch(
    `https://api.hypixel.net/v2/skyblock/museum?key=${apiKey}&profile=${profileId}`,
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch museum data for profile ${profileId}. Status: ${response.status}`,
    );
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(`API error: ${data.cause}`);
  }

  if (!data.members) {
    throw new Error(`No museum data found for profile ${profileId}`);
  }

  return data.members;
};
