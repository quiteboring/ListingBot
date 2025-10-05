import { EmbedBuilder } from 'discord.js';
import { getUUID } from '../../api/functions/getUUID.js';
import { getMuseumData } from '../../api/functions/getMuseumData.js';
import { getMinionData } from '../../api/stats/minion.js';
import { getMember } from '../../api/stats/member.js';
import { getNetworth } from '../../api/functions/getNetworth.js';
import { getGarden } from '../../api/stats/garden.js';
import { getProfileData } from '../../api/functions/getProfileData.js';
import { getGardenData } from '../../api/functions/getGardenData.js';
import { getSlayer } from '../../api/stats/slayer.js';
import { getMining } from '../../api/stats/mining.js';
import { getSkillAverage } from '../../api/stats/skills.js';
import { getDungeons } from '../../api/stats/dungeons.js';
import { getSBLevel } from '../../api/stats/player.js';
import { formatNumber } from '../format.js';
import { getRank } from '../../api/functions/getRank.js';
import colors from '../../colors.js';

const showEmoji = (emojis, name) => {
  return emojis[name] ? `${emojis[name]} ` : '';
};

export const generateMainEmbed = async (client, interaction, ign) => {
  const emojis = (await client.db.get('emojis')) || {};

  const uuid = await getUUID(ign);
  const rank = await getRank(client.hyApiKey, uuid);

  const profile = await getProfileData(client.hyApiKey, uuid);
  const gardenData = await getGardenData(
    client.hyApiKey,
    profile.profile_id,
  );

  const museumData = await getMuseumData(
    client.hyApiKey,
    profile.profile_id,
  );

  const garden = getGarden(gardenData);
  const minions = getMinionData(profile);

  const member = getMember(profile, uuid);
  const mining = getMining(member);
  const dungeons = getDungeons(member);
  const networth = await getNetworth(profile, member, museumData);

  const embed = new EmbedBuilder()
    .setTitle('Account Information')
    .setThumbnail(`https://mc-heads.net/body/anonymous/left`)
    .setFields([
      {
        name: 'Rank',
        value: `${emojis[rank + '1']}${emojis[rank + '2']}`,
        inline: false,
      },
      {
        name: `${showEmoji(emojis, 'sblevel')}SB Level`,
        value: getSBLevel(member).toString(),
        inline: true,
      },
      {
        name: `${showEmoji(emojis, 'foraging')}Skill Average`,
        value: getSkillAverage(member, profile).toString(),
        inline: true,
      },
      {
        name: `${showEmoji(emojis, 'maddox_batphone')}Slayer`,
        value: Object.values(getSlayer(member))
          .map((slayer) => slayer.level)
          .join('/'),
        inline: true,
      },
      {
        name: `${showEmoji(emojis, 'bank')}Networth`,
        value: (() => {
          if (!networth) return 'No Networth Data';
          const totalNetworth = (networth.networth ?? 0).toFixed(2);
          const unsoulboundNetworth = (
            networth.unsoulboundNetworth ?? 0
          ).toFixed(2);
          const coins = (
            (networth.purse ?? 0) + (networth.bank ?? 0)
          ).toFixed(2);
          return `**Total:** ${formatNumber(totalNetworth)}\n**Unsoulbound:** ${formatNumber(unsoulboundNetworth)}\n**Coins:** ${formatNumber(coins)}`;
        })(),
        inline: true,
      },
      {
        name: `${showEmoji(emojis, 'garden')}Garden`,
        value: (() => {
          if (!garden) return 'No Garden Data';
          const level = garden.level.level ?? 0;

          const milestoneLevels = Object.values(
            garden.cropMilestones ?? {},
          ).map((crop) => crop.level ?? 0);

          const average = milestoneLevels.length
            ? (
                milestoneLevels.reduce((sum, val) => sum + val, 0) /
                milestoneLevels.length
              ).toFixed(2)
            : '0';

          return `**Level:** ${level.toFixed(2)}\n**MS Avg:** ${average}`;
        })(),
        inline: true,
      },
      {
        name: `${showEmoji(emojis, 'dungeon_skull')}Dungeons`,
        value: `**Catacombs:** ${dungeons.dungeons.level.toFixed(2)}\n**Class Avg:** ${dungeons.classAverage.toFixed(2)}`,
        inline: true,
      },
      {
        name: `${showEmoji(emojis, 'pickaxe')}Mining`,
        value: (() => {
          if (!mining) return 'No Mining Data';
          const level = mining.level?.level ?? 0;
          const powder = mining.powder ?? {};
          const mithril = powder.mithril?.total ?? 0;
          const gemstone = powder.gemstone?.total ?? 0;
          const glacite = powder.glacite?.total ?? 0;
          return `**HOTM Level:** ${level}\n**Mithril Powder:** ${formatNumber(mithril)}\n**Gemstone Powder:** ${formatNumber(gemstone)}\n**Glacite Powder:** ${formatNumber(glacite)}`;
        })(),
        inline: true,
      },
      {
        name: `${showEmoji(emojis, 'cobblestone_minion')}Minions`,
        value: minions
          ? `**Total Slots:** ${minions.total}\n**Crafted Slots:** ${minions.crafted} (**${minions.untilNext}** until next)\n**Bonus Slots:** ${minions.community}/5`
          : 'No Minion Data',
        inline: true,
      },
    ])
    .setColor(colors.mainColor)
    .setFooter({
      iconURL: interaction.member.displayAvatarURL(),
      text: `Listed by ${interaction.member.displayName}`,
    })
    .setTimestamp();

  return embed;
};

const baseStatEmbed = (title) => {
  return new EmbedBuilder()
    .setTitle(`Account Information - ${title}`)
    .setColor(colors.mainColor)
    .setFooter({
      text: 'Made by Nathan | https://quiteboring.dev',
      iconURL: 'https://quiteboring.dev/pfp.jpg'
    })
}

export const generateSkillsEmbed = async (
  client,
  interaction,
  ign,
) => {
  const emojis = (await client.db.get('emojis')) || {};

  const showEmoji = (name) => {
    return emojis[name] ? `${emojis[name]} ` : '';
  };

  const embed = baseStatEmbed('Skills');

  return embed;
};

export const generateDungeonsEmbed = async (
  client,
  interaction,
  ign,
) => {
  const emojis = (await client.db.get('emojis')) || {};

  const showEmoji = (name) => {
    return emojis[name] ? `${emojis[name]} ` : '';
  };

  const embed = baseStatEmbed('Dungeons');

  return embed;
};

export const generateKuudraEmbed = async (
  client,
  interaction,
  ign,
) => {
  const emojis = (await client.db.get('emojis')) || {};

  const showEmoji = (name) => {
    return emojis[name] ? `${emojis[name]} ` : '';
  };

  const embed = baseStatEmbed('Kuudra');

  return embed;
};

export const generateFarmingEmbed = async (
  client,
  interaction,
  ign,
) => {
  const emojis = (await client.db.get('emojis')) || {};

  const embed = baseStatEmbed('Farming');

  return embed;
};

export const generateNetworthEmbed = async (
  client,
  interaction,
  ign,
) => {
  const emojis = (await client.db.get('emojis')) || {};

  const embed = baseStatEmbed('Networth');

  return embed;
};