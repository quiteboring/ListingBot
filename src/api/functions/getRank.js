import fetch from 'node-fetch';

const cache = new Map();

export const getRank = async (apiKey, uuid) => {
  if (cache.has(uuid)) {
    const data = cache.get(uuid);

    if (data.last_save + 300000 > Date.now()) {
      return data.data;
    }
  }

  const response = await fetch(
    `https://api.hypixel.net/v2/player?key=${apiKey}&uuid=${uuid}`,
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch player data for ${uuid}. Status: ${response.status}`,
    );
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(`API error: ${data.cause}`);
  }

  if (!data.player) {
    throw new Error(`No player data found for ${uuid}`);
  }

  const player = data?.player;
  let rank = '**` Non `**';

  if (player.prefix) {
    rank = player.prefix.replace(/§[0-9|a-z]|\[|\]/g, '');
  } else if (player.rank && 'NORMAL' !== player.rank) {
    switch (player.rank) {
      case 'YOUTUBER':
        rank = '**` YouTuber `**';
        break;
      default:
        rank = '**` Non `**';
        break;
    }
  } else {
    switch (player.newPackageRank) {
      case 'MVP_PLUS':
        rank =
          player.monthlyPackageRank &&
          'SUPERSTAR' === player.monthlyPackageRank
            ? '**` Mvp++ `**'
            : '**` Mvp+ `**';
        break;
      case 'MVP':
        rank = '**` Mvp `**';
        break;
      case 'VIP_PLUS':
        rank = '**` Vip+ `**';
        break;
      case 'VIP':
        rank = '**` Vip `**';
        break;
      default:
        rank =
          player.monthlyPackageRank &&
          'SUPERSTAR' === player.monthlyPackageRank
            ? '**` Mvp++ `**'
            : '**` Non `**';
    }
  }

  cache.set(uuid, { data: rank, last_save: Date.now() });
  return rank;
};
