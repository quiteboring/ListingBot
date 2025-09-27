import { errorEmbed, successEmbed } from './embed.js';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CategoryChannel,
  ChannelType,
  EmbedBuilder,
  MessageFlags,
  PermissionsBitField,
} from 'discord.js';
import config from '../config.js';

export const saveTicketsCategory = async (client, interaction) => {
  const category = interaction.options.getChannel('category');

  if (!(category instanceof CategoryChannel)) {
    await interaction.reply({
      embeds: [errorEmbed('Provided value is not a category.')],
      flags: MessageFlags.Ephemeral,
    });

    return;
  }

  await client.db.set('tickets_category', category.id);
  await interaction.reply({
    embeds: [
      successEmbed(
        `Successfully set ticket category ID to \`${category.id}\``,
      ),
    ],

    flags: MessageFlags.Ephemeral,
  });
};

export const createTicketChannel = async (
  client,
  interaction,
  title,
  embedFields,
) => {
  try {
    const ticketsCategoryId = await client.db.get('tickets_category');
    let index = await client.db.get('ticket_count');
    let role = await client.db.get('seller_role');
    if (!index) index = 1;

    const channel = await interaction.guild.channels.create({
      name: `ticket-${index}`,
      type: ChannelType.GuildText,
      parent: ticketsCategoryId,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: interaction.user.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory,
          ],
        },
        ...(role
          ? [
              {
                id: role,
                allow: [
                  PermissionsBitField.Flags.ViewChannel,
                  PermissionsBitField.Flags.SendMessages,
                  PermissionsBitField.Flags.ReadMessageHistory,
                ],
              },
            ]
          : []),
      ],
    });

    await client.db.set('ticket_count', index + 1);
    interaction.reply({
      embeds: [successEmbed('Made ticket!')],
      flags: MessageFlags.Ephemeral,
    });

    const embed = new EmbedBuilder()
      .setTitle(title)
      .addFields(embedFields)
      .setFooter({
        text: `${interaction.user.displayName} (${interaction.user.id})`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      })
      .setTimestamp(Date.now())
      .setColor(config.mainColor);

    await channel.send({
      content: `<@${interaction.user.id}>`,
      embeds: [embed],
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
  } catch (err) {
    interaction.reply({
      embeds: [errorEmbed('Unable to make ticket.')],
      flags: MessageFlags.Ephemeral,
    });
  }
};

export const closeTicket = async (client, interaction) => {
  const channel = interaction.channel;
  const userOverwrite = channel.permissionOverwrites.cache.find(
    (overwrite) => overwrite.type === 1,
  );

  if (!userOverwrite) {
    await interaction.reply({
      embeds: [
        errorEmbed(
          "Couldn't find the ticket creator to close the ticket.",
        ),
      ],
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const userId = userOverwrite.id;
  await channel.permissionOverwrites.delete(userId);
  await channel.edit({
    name: `closed-${channel.name.split('-')[1]}`
  })

  await interaction.deferUpdate();
  await interaction.channel.send({
    embeds: [errorEmbed(`Ticket closed by <@${interaction.user.id}>`)],
    components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('reopen_ticket')
          .setLabel('Open')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('🔓'),
        new ButtonBuilder()
          .setCustomId('delete_ticket')
          .setLabel('Delete')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('⛔'),
      ),
    ],
  });

  await client.db.set(
    `${interaction.channel.id}-status`,
    `closed-${userId}`,
  );
};

export const reopenTicket = async (client, interaction) => {
  const channel = interaction.channel;
  const channelStatus = await client.db.get(`${channel.id}-status`);
  const userId = channelStatus.split('-')[1];

  await channel.permissionOverwrites.create(userId, {
    ViewChannel: true,
    SendMessages: true,
    ReadMessageHistory: true,
  });

  await channel.edit({
    name: `ticket-${channel.name.split('-')[1]}`
  })

  await client.db.set(`${interaction.channel.id}-status`, 'open');
  await interaction.message.edit({ components: [] });
  await interaction.channel.send({
    embeds: [
      successEmbed(`Ticket reopened by <@${interaction.user.id}>`),
    ],
  });
};