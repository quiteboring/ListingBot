import {
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import { errorEmbed } from '../utils/embeds.js';
import { getUUID } from '../api/functions/getUUID.js';
import { getMuseumData } from '../api/functions/getMuseumData.js';
import { getMinionData } from '../api/stats/minion.js';
import { getMember } from '../api/stats/member.js';
import { getNetworth } from '../api/functions/getNetworth.js';
import { getGarden } from '../api/stats/garden.js';
import { getProfileData } from '../api/functions/getProfileData.js';
import { getGardenData } from '../api/functions/getGardenData.js';
import { getSlayer } from '../api/stats/slayer.js';
import { getMining } from '../api/stats/mining.js';
import { getSkillAverage, getSkills } from '../api/stats/skills.js';
import { getDungeons } from '../api/stats/dungeons.js';
import colors from '../colors.js';
import { getSBLevel } from '../api/stats/player.js';
import { formatNumber } from '../utils/format.js';

export default {
  data: new SlashCommandBuilder()
    .setName('account')
    .setDescription('View account details!'),

  /**
   * @param {import('../bot/client.js').default} client
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(client, interaction) {
    try {
      const ign = '56ms';

      const uuid = await getUUID(ign);
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
            name: 'SB Level',
            value: getSBLevel(member).toString(),
            inline: true,
          },
          {
            name: 'Skill Average',
            value: getSkillAverage(member, profile).toString(),
            inline: true,
          },
          {
            name: 'Slayer',
            value: Object.values(getSlayer(member))
              .map((slayer) => slayer.level)
              .join('/'),
            inline: true,
          },
          {
            name: 'Networth',
            value: (() => {
              if (!networth) return 'No Networth Data';
              const totalNetworth = (networth.networth ?? 0).toFixed(
                2,
              );
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
            name: 'Garden',
            value: (() => {
              if (!garden) return 'No Garden Data';
              const level = garden.level.level ?? 0;

              const milestoneLevels = Object.values(
                garden.cropMilestones ?? {},
              ).map((crop) => crop.level ?? 0);

              const average = milestoneLevels.length
                ? (
                    milestoneLevels.reduce(
                      (sum, val) => sum + val,
                      0,
                    ) / milestoneLevels.length
                  ).toFixed(2)
                : '0';

              return `**Level:** ${level.toFixed(2)}\n**MS Avg:** ${average}`;
            })(),
            inline: true,
          },
          {
            name: 'Dungeons',
            value: `**Catacombs:** ${dungeons.dungeons.level.toFixed(2)}\n**Class Avg:** ${dungeons.classAverage.toFixed(2)}`,
            inline: true,
          },
          {
            name: 'Mining',
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
            name: 'Minions',
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

      await interaction.reply({
        embeds: [embed],
      });
    } catch (err) {
      await interaction.reply({
        embeds: [errorEmbed(err)],
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
