import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  MessageFlags,
  PermissionsBitField,
} from 'discord.js';
import colors from '../colors.js';
import { errorEmbed, successEmbed } from './embed.js';
import { getData } from './api.js';
import {
  getDungeonData,
  getGardenData,
  getMiningData,
  getMinionData,
  getNetworthData,
  getRank,
  getSBLevel,
  getSkillAverage,
  getSlayerData,
} from './account.js';
import { hasAdmin, isSeller } from './member.js';

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

  if (isNaN(parseFloat(price))) {
    return await interaction.reply({
      embeds: [
        errorEmbed(
          'Invalid input. Please provide a valid number for the prices.',
        ),
      ],

      flags: MessageFlags.Ephemeral,
    });
  }

  const channel = await interaction.guild.channels.create({
    name: `💲${price}│listing-${listingIndex}`,
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
    `listing_count_${interaction.guild.id}`,
    listingIndex + 1,
  );

  try {
    await interaction.deferUpdate();

    const spacer = { name: '\u200B', value: '\u200B', inline: true };
    const emojis = (await client.db.get('emojis')) || {};
    const methods =
      (await client.db.get(
        `payment_methods_${interaction.user.id}`,
      )) || 'None Provided';

    const { hyacc, profile, networth, garden, minions } =
      await getData(client, client.hypixelApiKey, username);

    function getEmoji(name) {
      return emojis[name] ? emojis[name] + ' ' : '';
    }

    const embed = new EmbedBuilder()
      .setTitle('Account Information')
      .setColor(colors.mainColor)
      .setThumbnail(`https://mc-heads.net/body/anonymous/left`)
      .setFields([
        {
          name: 'Rank',
          value: getRank(emojis, hyacc),
          inline: false,
        },
        {
          name: `${getEmoji('sblevel')}SB Level`,
          value: getSBLevel(profile),
          inline: true,
        },
        {
          name: `${getEmoji('foraging')}Skill Average`,
          value: getSkillAverage(profile),
          inline: true,
        },
        {
          name: `${getEmoji('maddox_batphone')}Slayer`,
          value: getSlayerData(profile),
          inline: true,
        },

        {
          name: `${getEmoji('bank')}Networth`,
          value: getNetworthData(networth),
          inline: true,
        },
        {
          name: `${getEmoji('garden')}Garden`,
          value: getGardenData(garden),
          inline: true,
        },
        {
          name: `${getEmoji('dungeon_skull')}Dungeons`,
          value: getDungeonData(profile),
          inline: true,
        },

        {
          name: `${getEmoji('pickaxe')}Mining`,
          value: getMiningData(profile),
          inline: true,
        },
        {
          name: `${getEmoji('cobblestone_minion')}Minions`,
          value: getMinionData(minions),
          inline: true,
        },
        spacer,
        {
          name: `💰 Price`,
          value: `$${price}`,
          inline: true,
        },
        {
          name: `💳 Payment Method(s)`,
          value: methods,
          inline: true,
        },
      ])
      .setFooter({
        iconURL: interaction.member.displayAvatarURL(),
        text: `Listed by ${interaction.member.displayName}`,
      })
      .setTimestamp();

    const listings =
      (await client.db.get(`accounts_${interaction.guild.id}`)) || [];

    listings.push({
      channel: channel.id,
      ign: username,
    });

    await client.db.set(`accounts_${interaction.guild.id}`, listings);

    await channel.send({
      embeds: [embed],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setLabel('Buy Account')
            .setCustomId(`buy_account_${channel.id}`)
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('💸'),
          new ButtonBuilder()
            .setLabel('Unlist')
            .setCustomId(`unlist_account_${channel.id}`)
            .setStyle(ButtonStyle.Danger),
        ),
      ],
    });
  } catch (error) {
    await interaction.followUp({
      embeds: [errorEmbed('Could not fetch player data.')],
      flags: MessageFlags.Ephemeral,
    });
  }
};

/**
 * @param {import("../bot/client.js").default} client
 * @param {import("discord.js").Interaction} interaction
 */
export const createAccountTicket = async (client, interaction) => {
  const setup = await client.db.get(`setup_${interaction.guild.id}`);
  const rawIndex =
    (await client.db.get(`ticket_count_${interaction.guild.id}`)) ||
    1;
  const index =
    rawIndex < 10000
      ? String(rawIndex).padStart(4, '0')
      : String(rawIndex);

  if (!setup || !setup.ticketCategory || !setup.sellerRoles) {
    return await interaction.reply({
      embeds: [errorEmbed('Tickets have not properly been setup.')],
      flags: MessageFlags.Ephemeral,
    });
  }

  await interaction.deferUpdate();

  const spacer = { name: ' ', value: ' ' };
  const userPermissions = [
    PermissionsBitField.Flags.ViewChannel,
    PermissionsBitField.Flags.SendMessages,
    PermissionsBitField.Flags.ReadMessageHistory,
  ];

  const channel = await interaction.guild.channels.create({
    name: `ticket-${index}`,
    type: ChannelType.GuildText,
    parent: setup.ticketCategory,
    permissionOverwrites: [
      {
        id: interaction.guild.id,
        deny: [PermissionsBitField.Flags.ViewChannel],
      },
      { id: interaction.user.id, allow: userPermissions },
      ...(setup.sellerRoles || []).map((roleId) => ({
        id: roleId,
        allow: userPermissions,
      })),
    ],
  });

  await client.db.set(
    `ticket_count_${interaction.guild.id}`,
    rawIndex + 1,
  );

  const msg = await channel.send({
    content: `<@${interaction.user.id}>`,
    embeds: [
      new EmbedBuilder()
        .setDescription('Your ticket has been created!')
        .setTitle('Account Ticket')
        .setFields([
          spacer,
          {
            name: 'Interested Account',
            value: `<#${interaction.customId.split('_')[2]}>`,
          },
          spacer,
        ])
        .setFooter({
          iconURL: interaction.user.displayAvatarURL(),
          text: `Created by ${interaction.user.displayName}`,
        })
        .setTimestamp(Date.now())
        .setColor(colors.mainColor),
    ],
    components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('claim_ticket')
          .setLabel('Claim')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('🏷️'),
        new ButtonBuilder()
          .setCustomId('unclaim_ticket')
          .setLabel('Unclaim')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('❌'),
        new ButtonBuilder()
          .setCustomId('close_ticket')
          .setLabel('Close')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('🔒'),
      ),
    ],
  });

  await msg.pin();

  const commands = await client.application.commands.fetch();
  const termsCommand = commands.find((c) => c.name === 'tos');

  await channel.send({
    embeds: [
      mainEmbed(
        `We require you to agree to our Terms of Service before you can buy something.
Refer to ${
          termsCommand
            ? `</tos view:${termsCommand.id}>`
            : 'with `/tos view`'
        }`,
      ),
    ],
  });

  await client.db.set(
    `ticket_${interaction.guild.id}_${channel.id}`,
    {
      creatorId: interaction.user.id,
      message: msg.id,
      status: 'open',
      claimedBy: 'none',
      middlemanId: null,
    },
  );
};

export const unlistAccount = async (
  client,
  interaction,
  channelId,
) => {
  const key = `setup_${interaction.guild.id}`;
  const ticket = await client.db.get(key);

  if (!ticket || !ticket.creatorId) {
    return interaction.reply({
      embeds: [
        errorEmbed('Server has not been setup. Run /setup wizard'),
      ],
      flags: MessageFlags.Ephemeral,
    });
  }

  if (
    !hasAdmin(interaction) &&
    !(await isSeller(client, interaction))
  ) {
    return interaction.reply({
      embeds: [errorEmbed('You cannot unlist this account.')],
      flags: MessageFlags.Ephemeral,
    });
  }

  const listings =
    (await client.db.get(`accounts_${interaction.guild.id}`)) || [];

  const exists = listings.some(
    (listing) => listing.channel === channelId,
  );

  if (!exists) {
    return interaction.reply({
      embeds: [errorEmbed('No account found.')],
      flags: MessageFlags.Ephemeral,
    });
  }

  const updatedListings = listings.filter(
    (listing) => listing.channel !== channelId,
  );

  await client.db.set(
    `accounts_${interaction.guild.id}`,
    updatedListings,
  );

  const channel = await interaction.guild.channels.fetch(channelId);

  setTimeout(async () => {
    if (channel) {
      await channel.delete();
    }
  }, 3000);

  await interaction.reply({
    embeds: [successEmbed('Unlisting account in 3 seconds...')],
    flags: MessageFlags.Ephemeral,
  });
};
