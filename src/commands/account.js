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
import colors from '../colors.js';
import { getSlayer } from '../api/stats/slayer.js';
import { getMining } from '../api/stats/mining.js';
import { getSkillAverage, getSkills } from '../api/stats/skills.js';
import { getDungeons } from '../api/stats/dungeons.js';

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
      const minionData = getMinionData(profile);

      const member = getMember(profile, uuid);
      const slayers = getSlayer(member);
      const mining = getMining(member);
      const dungeons = getDungeons(member);
      const skills = getSkills(member, profile);
      const skillAvg = getSkillAverage(member, profile);
      const networth = await getNetworth(profile, member, museumData);

      const embed = new EmbedBuilder()
        .setTitle('Account Information')
        .setThumbnail(`https://mc-heads.net/body/anonymous/left`)
        .setColor(colors.mainColor);

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
