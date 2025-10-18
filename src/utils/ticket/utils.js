import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  ModalBuilder,
  PermissionFlagsBits,
} from 'discord.js';
import { errorEmbed } from '../embeds.js';

export const createTicket = async (
  client,
  interaction,
  category,
  name,
  embed,
  content = `<@${interaction.user.id}>`,
) => {
  const setup =
    (await client.db.get(`guild_${interaction.guild.id}`)) || {};

  const tickets = setup.tickets || [];
  const sellers = setup.seller_roles || [];

  const channel = await interaction.guild.channels.create({
    name: `${name}\u2502${interaction.user.username}`,
    type: ChannelType.GuildText,
    parent: category,
    permissionOverwrites: [
      {
        id: interaction.guild.roles.everyone,
        deny: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
        ],
      },
      ...sellers.map((roleId) => ({
        id: roleId,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
        ],
      })),
      {
        id: interaction.user.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
        ],
      },
    ],
  });

  const components = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('ticket:claim')
      .setLabel('Claim Ticket')
      .setEmoji('✋')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('ticket:close')
      .setLabel('Close Ticket')
      .setEmoji('🔒')
      .setStyle(ButtonStyle.Danger),
  );

  const msg = await channel.send({
    content: content,
    embeds: [embed],
    components: [components],
  });

  tickets.push({
    users: interaction.user.id,
    status: 'open',
    channelId: channel.id,
    messageId: msg.id,
  });

  await msg.pin();
  await client.db.set(`guild_${interaction.guild.id}`, {
    ...setup,
    tickets,
  });

  const tos = setup?.tos || '';

  if (!tos || tos.length === 0) return channel;

  const users = tos?.users || [];
  const hasAccepted = users.includes(interaction.user.id);

  if (hasAccepted) return channel;

  const commands = await client.application.commands.fetch();
  const termsCommand = commands.find((c) => c.name === 'tos');

  await msg.reply({
    embeds: [
      errorEmbed(
        `Please read and accept the following Terms of Service to continue: ${
          termsCommand
            ? `</tos view:${termsCommand.id}>`
            : 'with `/tos view`'
        }`,
      ),
    ],
  });

  return channel;
};

export const createModal = async (client, interaction, elements) => {
  const modal = new ModalBuilder()
    .setCustomId(interaction.customId)
    .setTitle('Ticket Information')
    .addComponents(
      elements.map((el) => new ActionRowBuilder().addComponents(el)),
    );

  await interaction.showModal(modal);
};
