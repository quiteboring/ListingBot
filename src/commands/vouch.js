import {
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import colors from '../utils/colors.js';

export default {
  data: new SlashCommandBuilder()
    .setName('vouch')
    .setDescription('Vouches or something...')
    .addSubcommand((sub) =>
      sub
        .setName('leaderboard')
        .setDescription('Shows the vouch leaderboard'),
    )
    .addSubcommand((sub) =>
      sub
        .setName('user')
        .setDescription("Views a user's vouches or yourself.")
        .addUserOption((opt) =>
          opt
            .setName('user')
            .setDescription('The user to view')
            .setRequired(false),
        ),
    ),
  /**
   * @param {import('../bot/client.js').default} client
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(client, interaction) {
    const sub = interaction.options.getSubcommand();
    const guild =
      (await client.db.get(`guild_${interaction.guild.id}`)) || {};
    const vouches = guild?.vouches || [];

    switch (sub) {
      case 'leaderboard':
        const vouchCounts = {};

        vouches.forEach((vouch) => {
          if (!vouchCounts[vouch.user]) {
            vouchCounts[vouch.user] = 0;
          }
          vouchCounts[vouch.user]++;
        });

        const sortedVouches = Object.entries(vouchCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10);

        const leaderboardEmbed = new EmbedBuilder()
          .setTitle('🏆 Vouch Leaderboard')
          .setColor(colors.mainColor)
          .setDescription(
            sortedVouches.length > 0
              ? sortedVouches
                  .map(
                    ([userId, count], index) =>
                      `**#${index + 1}** <@${userId}> - **${count}** vouches`,
                  )
                  .join('\n')
              : 'No vouches have been recorded yet.',
          )
          .setFooter({
            text: `Vouches in ${interaction.guild.name}`,
            iconURL: interaction.guild.iconURL(),
          });

        await interaction.reply({
          embeds: [leaderboardEmbed],
          flags: MessageFlags.Ephemeral,
        });
        break;
      case 'user':
        const user =
          interaction.options.getUser('user') || interaction.user;
        const userVouches = vouches
          .filter((vouch) => vouch.user === user.id)
          .slice(0, 5);

        const embed = new EmbedBuilder()
          .setTitle(`📊 Vouches for ${user.username}`)
          .addFields([
            {
              name: '🌟 Total Vouches',
              value: `${userVouches.length}`,
              inline: true,
            },
            {
              name: '👥 Unique Vouches',
              value: `${new Set(userVouches.map((v) => v.vouchedBy)).size}`,
              inline: true,
            },
            {
              name: '🕒 Recent Vouches',
              value:
                userVouches.length > 0
                  ? userVouches
                      .map(
                        (vouch, index) =>
                          `・ <@${vouch.vouchedBy}> <t:${Math.floor(vouch.date / 1000)}:R>`,
                      )
                      .join('\n')
                  : 'No vouches yet.',
              inline: false,
            },
          ])
          .setColor(colors.mainColor)
          .setFooter({
            text: `Vouches in ${interaction.guild.name}`,
            iconURL: interaction.guild.iconURL(),
          });

        if (userVouches.length === 0) {
          embed.setDescription('This user has no vouches.');
        }

        await interaction.reply({
          embeds: [embed],
          flags: MessageFlags.Ephemeral,
        });
        break;
    }
  },
};
