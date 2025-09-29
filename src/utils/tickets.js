import {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  PermissionsBitField,
  ChannelType,
  User,
  ModalSubmitFields,
} from 'discord.js';
import { errorEmbed } from './embed.js';
import colors from '../colors.js';

export const showModal = async (interaction, options, id) => {
  const modal = new ModalBuilder()
    .setCustomId(id || interaction.customId)
    .setTitle(
      (id || interaction.customId)
        .replace('_ticket', '')
        .split('_')
        .map((word) => word[0].toUpperCase() + word.slice(1))
        .join(' '),
    );

  const rows = options.map((opt) => {
    const input = new TextInputBuilder()
      .setCustomId(opt.customId)
      .setLabel(opt.label)
      .setStyle(opt.style || TextInputStyle.Short)
      .setPlaceholder(opt.placeholder || '')
      .setRequired(opt.required ?? true);

    return new ActionRowBuilder().addComponents(input);
  });

  modal.addComponents(rows);
  await interaction.showModal(modal);
};

/**
 * @param {import("../bot/client").default} client
 * @param {import("discord.js").Interaction} interaction
 */
export const createTicket = async (client, interaction) => {
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

  let fields = [];
  let middlemanId = null;

  if (interaction.isModalSubmit()) {
    fields = interaction.fields.fields.map((input, key) => ({
      name: key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      value: input.value || 'N/A',
    }));

    if (interaction.fields.fields.has('user_id')) {
      const value = interaction.fields.getTextInputValue('user_id');
      const user = await interaction.guild.members.fetch(value);
      middlemanId = user.id;
    }
  } else if (interaction.isStringSelectMenu()) {
    fields = [
      {
        name: 'Selected Rank',
        value: interaction.values[0]
          .replace(/^mfa/i, '')
          .replace(/plus/i, '+')
          .replace(/^\w/, (c) => c.toUpperCase()),
      },
    ];
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
      ...(middlemanId
        ? [{ id: middlemanId, allow: userPermissions }]
        : []),
    ],
  });

  await client.db.set(
    `ticket_count_${interaction.guild.id}`,
    rawIndex + 1,
  );

  const msg = await channel.send({
    content: `<@${interaction.user.id}>${middlemanId ? ` <@${middlemanId}>` : ''}`,
    embeds: [
      new EmbedBuilder()
        .setDescription('Your ticket has been created!')
        .setTitle(
          interaction.customId
            .replace('_ticket', '')
            .split('_')
            .map((word) => word[0].toUpperCase() + word.slice(1))
            .join(' ')
            .concat(' Ticket'),
        )
        .setFields(
          fields.length ? [spacer, ...fields, spacer] : [spacer],
        )
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

  await client.db.set(
    `ticket_${interaction.guild.id}_${channel.id}`,
    {
      creatorId: interaction.user.id,
      message: msg.id,
      status: 'open',
      claimedBy: 'none',
      middlemanId,
    },
  );
};
