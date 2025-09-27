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
  TextChannel,
} from 'discord.js';
import config from '../config.js';
import { createTranscript } from 'discord-html-transcripts';

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
      name: `ticket-${String(index).padStart(4, '0')}`,
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
    await client.db.set(`${channel.id}-creator`, interaction.user.id);

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
  try {
    const channel = interaction.channel;
    const channelCreator = await client.db.get(
      `${channel.id}-creator`,
    );

    if (channelCreator) {
      await channel.permissionOverwrites.edit(channelCreator, {
        ViewChannel: false,
        SendMessages: false,
        ReadMessageHistory: false,
      });

      await client.db.set(
        `${interaction.channel.id}-status`,
        `closed`,
      );

      await interaction.deferUpdate();
      await interaction.channel.send({
        embeds: [
          errorEmbed(`Ticket closed by <@${interaction.user.id}>`),
        ],
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('reopen_ticket')
              .setLabel('Open')
              .setStyle(ButtonStyle.Secondary)
              .setEmoji('🔓'),
            new ButtonBuilder()
              .setCustomId('gen_transcript')
              .setLabel('Transcript')
              .setStyle(ButtonStyle.Secondary)
              .setEmoji('📄'),
            new ButtonBuilder()
              .setCustomId('delete_ticket')
              .setLabel('Delete')
              .setStyle(ButtonStyle.Secondary)
              .setEmoji('⛔'),
          ),
        ],
      });
      return;
    }

    await interaction.reply({
      embeds: [
        errorEmbed(
          "Couldn't find the ticket creator to close the ticket.",
        ),
      ],
      flags: MessageFlags.Ephemeral,
    });
  } catch (err) {
    console.log(err);
  }
};

export const reopenTicket = async (client, interaction) => {
  const channel = interaction.channel;
  const channelCreator = await client.db.get(`${channel.id}-creator`);

  await channel.permissionOverwrites.edit(channelCreator, {
    ViewChannel: true,
    SendMessages: true,
    ReadMessageHistory: true,
  });

  await client.db.set(`${interaction.channel.id}-status`, 'open');
  await interaction.message.edit({ components: [] });
  await interaction.channel.send({
    embeds: [
      successEmbed(`Ticket reopened by <@${interaction.user.id}>`),
    ],
  });
};
