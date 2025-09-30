import { ChannelType, EmbedBuilder, MessageFlags } from 'discord.js';
import colors from '../colors.js';
import { errorEmbed } from './embed.js';
import {
  getNetworth,
} from './api.js';

/**
 * @param {import("../bot/client.js").default} client
 * @param {import("discord.js").Interaction} interaction
 */
export const createAccountChannel = async (
  client,
  interaction,
  username,
  price,
) => {
  const setup = await client.db.get(`setup_${interaction.guild.id}`);
  const listingIndex =
    (await client.db.get(`listing_count_${interaction.guild.id}`)) ||
    1;
  const category = interaction.guild.channels.cache.get(
    setup?.listingsCategory,
  );

  if (!category || category.type !== ChannelType.GuildCategory) {
    return interaction.reply({
      embeds: [errorEmbed('Invalid listings category configured.')],
      flags: MessageFlags.Ephemeral,
    });
  }

  // const channel = await interaction.guild.channels.create({
  //   name: `💲${price}│listing-${listingIndex}`,
  //   type: ChannelType.GuildText,
  //   parent: category.id,
  //   permissionOverwrites: category.permissionOverwrites.cache.map(
  //     (po) => ({
  //       id: po.id,
  //       allow: po.allow.bitfield,
  //       deny: po.deny.bitfield,
  //     }),
  //   ),
  // });

  // await client.db.set(
  //   `listing_${interaction.guild.id}_${channel.id}`,
  //   { username, price },
  // );

  // await client.db.set(
  //   `listing_count_${interaction.guild.id}`,
  //   listingIndex + 1,
  // );

  try {
    await interaction.deferUpdate();

    const networth = await getNetworth(
      client.hypixelApiKey,
      username,
    );

    // const embed = new EmbedBuilder()
    //   .setTitle('Account Information')
    //   .setColor(colors.mainColor)
    //   .setThumbnail(`https://mc-heads.net/body/anonymous/left`)
    //   .setFooter({
    //     text: 'Username will be revealed after payment confirmation',
    //   })
    //   .setTimestamp();

    // await channel.send({ embeds: [embed] });
  } catch (error) {
    await interaction.followUp({
      embeds: [errorEmbed('Could not fetch player data.')],
      flags: MessageFlags.Ephemeral,
    });
  }
};
