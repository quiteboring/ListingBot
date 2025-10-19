import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits,
} from 'discord.js';
import { getStatsBreakdown } from './component.js';

export const createListing = async (
  client,
  interaction,
  category,
  ign,
  price,
  embed,
  content = `<@${interaction.user.id}>`,
) => {
  const setup =
    (await client.db.get(`guild_${interaction.guild.id}`)) || {};

  const listings = setup?.listings || [];

  const channel = await interaction.guild.channels.create({
    name: `💲${price}\u2502account`,
    type: ChannelType.GuildText,
    parent: category,
    permissionOverwrites: [
      {
        id: interaction.guild.roles.everyone,
        allow: [PermissionFlagsBits.ViewChannel],
        deny: [PermissionFlagsBits.SendMessages],
      },
    ],
  });

  const row = await getStatsBreakdown(client);
  const secondRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('account:buy')
      .setStyle(ButtonStyle.Secondary)
      .setLabel('Buy Account')
      .setEmoji('💸'),
    new ButtonBuilder()
      .setCustomId('account:unlist')
      .setStyle(ButtonStyle.Danger)
      .setLabel('Unlist'),
  );

  const msg = await channel.send({
    content: content,
    embeds: [embed],
    components: [row, secondRow],
  });

  listings.push({
    messageId: msg.id,
    channelId: channel.id,
    sellerId: interaction.member.id,
    ign: ign,
  });

  await client.db.set(`guild_${interaction.guild.id}`, {
    ...setup,
    listings,
  });

  return channel;
};
