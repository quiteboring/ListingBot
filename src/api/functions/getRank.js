import fetch from 'node-fetch';

export const getRank = async (apiKey, uuid) => {
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
  let rank = '';

  if (player.prefix) {
    rank = player.prefix.replace(/§[0-9|a-z]|\[|\]/g, '');
  } else if (player.rank && 'NORMAL' !== player.rank) {
    switch (player.rank) {
      case 'YOUTUBER':
        rank = 'youtube';
        break;
      default:
        rank = 'non';
        break;
    }
  } else {
    switch (player.newPackageRank) {
      case 'MVP_PLUS':
        rank =
          player.monthlyPackageRank &&
          'SUPERSTAR' === player.monthlyPackageRank
            ? 'mvp_plus_plus'
            : 'mvp_plus';
        break;
      case 'MVP':
        rank = 'mvp';
        break;
      case 'VIP_PLUS':
        rank = 'vip_plus';
        break;
      case 'VIP':
        rank = 'vip';
        break;
      default:
        rank =
          player.monthlyPackageRank &&
          'SUPERSTAR' === player.monthlyPackageRank
            ? 'mvp_plus_plus'
            : 'non';
    }
  }

  return rank.toLowerCase();
};
