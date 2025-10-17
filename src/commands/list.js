import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import { errorEmbed } from '../utils/embeds.js';
import { generateMainEmbed } from '../utils/listing/embed.js';
import { getStatsBreakdown } from '../utils/listing/component.js';
import { isSeller } from '../utils/checks.js';

export default {
  data: new SlashCommandBuilder()
    .setName('list')
    .setDescription('List an account!')
    .addStringOption((opt) =>
      opt
        .setName('ign')
        .setDescription('The IGN (ex: 56ms) of the account.'),
    ),

  /**
   * @param {import('../bot/client.js').default} client
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(client, interaction) {
    if (!isSeller(interaction.member)) {
      return await interaction.reply({
        embeds: [
          errorEmbed('Insufficient permissions to use this command.'),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      await interaction.deferReply();

      const ign = interaction.options.getString('ign');

      const listings =
        (await client.db.get(`listings_${interaction.guild.id}`)) ||
        [];

      const embed = await generateMainEmbed(client, interaction, ign);
      const row = await getStatsBreakdown(client);
      const secondRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('buy_account')
          .setStyle(ButtonStyle.Secondary)
          .setLabel('Buy Account')
          .setEmoji('💸'),
        new ButtonBuilder()
          .setCustomId('unlist_account')
          .setStyle(ButtonStyle.Danger)
          .setLabel('Unlist'),
      );

      await interaction.editReply({
        embeds: [embed],
        components: [row, secondRow],
      });

      const msg = await interaction.fetchReply();

      listings.push({
        messageId: msg.id,
        channelId: interaction.channel.id,
        ign: ign,
      });

      await client.db.set(
        `listings_${interaction.guild.id}`,
        listings,
      );
    } catch (err) {
      console.log(err);

      await interaction.editReply({
        embeds: [errorEmbed('Error: ' + err)],
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
