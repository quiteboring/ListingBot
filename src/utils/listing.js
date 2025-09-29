import { ChannelType, MessageFlags } from 'discord.js';
import { errorEmbed } from './embed.js';
import { ProfileNetworthCalculator } from 'skyhelper-networth';
import {
  getUUIDFromIGN,
  getProfileData,
  getMuseumData,
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
  const index =
    (await client.db.get(`listing_count_${interaction.guild.id}`)) ||
    1;

  const channelName = `💲${price}│listing-${index}`;
  const guild = interaction.guild;
  const category = guild.channels.cache.get(setup.listingsCategory);

  if (!category || category.type !== ChannelType.GuildCategory) {
    return interaction.reply({
      embeds: [errorEmbed('Invalid listings category configured.')],
      flags: MessageFlags.Ephemeral,
    });
  }

  const channel = await guild.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
    parent: category.id,
    permissionOverwrites: category.permissionOverwrites.cache.map(
      (po) => ({
        id: po.id,
        allow: po.allow.bitfield,
        deny: po.deny.bitfield,
      }),
    ),
  });
  await client.db.set(
    `listing_${interaction.guild.id}_${interaction.channel.id}`,
    { username, price },
  );

  await client.db.set(
    `listing_count_${interaction.guild.id}`,
    index + 1,
  );

  try {
    const uuid = await getUUIDFromIGN(username);
    const profileData = await getProfileData(
      client.hypixelApiKey,
      uuid,
    );
    const data = await client.hypixel.getSkyBlockProfile(
      profileData.profile_id,
    );

    const networthManager = new ProfileNetworthCalculator(
      profileData.members[uuid],
      await getMuseumData(
        client.hypixelApiKey,
        profileData.profile_id,
        uuid,
      ),
      profileData.banking?.balance ?? 0,
    );

    const networthData = await networthManager.getNetworth({
      onlyNetworth: true,
    });

    // Get more data and construct embed

    await interaction.deferUpdate();
  } catch (err) {
    return interaction.reply({
      embeds: [errorEmbed('Unable to fetch specified IGN.')],
      flags: MessageFlags.Ephemeral,
    });
  }
};
