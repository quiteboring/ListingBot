import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
  TextChannel,
} from 'discord.js';
import { isAdmin, isSeller } from '../../utils/checks.js';
import { createTranscript } from 'discord-html-transcripts';
import colors from '../../colors.js';
import { errorEmbed, successEmbed } from '../../utils/embeds.js';

export default {
  name: 'interactionCreate',

  /**
   * @param {import("../bot/client").default} client
   * @param {import("discord.js").Interaction} interaction
   */
  async execute(client, interaction) {
    if (
      !interaction.customId ||
      !interaction.customId.startsWith('ticket:')
    )
      return;

    const method = interaction.customId.split(':')[1];
    const guild =
      (await client.db.get(`guild_${interaction.guild.id}`)) || {};
    const tickets = guild?.tickets || [];
    const ticket = tickets.find(
      (t) => t.channelId === interaction.channel.id,
    );

    if (!ticket) {
      return interaction.reply({
        content: 'This ticket is not registered in the database.',
        flags: MessageFlags.Ephemeral,
      });
    }

    if (
      !isSeller(client, interaction.member) &&
      !isAdmin(interaction.member)
    ) {
      return await interaction.reply({
        embeds: [
          errorEmbed(
            'You do not have permissions to close the ticket.',
          ),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    switch (method) {
      case 'claim':
        this.handleClaimTicket(client, interaction, ticket);
        break;
      case 'unclaim':
        this.handleUnclaimTicket(client, interaction, ticket);
        break;
      case 'close':
        this.handleCloseTicket(client, interaction, ticket);
        break;
      case 'reopen':
        this.handleReopenTicket(client, interaction, ticket);
        break;
      case 'transcript':
        this.handleTranscriptTicket(client, interaction, ticket);
        break;
      case 'delete':
        this.handleDeleteTicket(client, interaction, ticket);
        break;
    }
  },

  async handleClaimTicket(client, interaction, ticket) {
    const guild =
      (await client.db.get(`guild_${interaction.guild.id}`)) || {};
    let tickets = guild?.tickets || [];
    tickets = tickets.filter((t) => t.channelId !== ticket.channelId);

    ticket.status = `claimed-${interaction.user.id}`;
    tickets.push(ticket);

    const components = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('ticket:unclaim')
        .setLabel('Unclaim Ticket')
        .setEmoji('✋')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('ticket:close')
        .setLabel('Close Ticket')
        .setEmoji('🔒')
        .setStyle(ButtonStyle.Danger),
    );

    await interaction.message.edit({
      components: [components],
    });

    await interaction.deferUpdate();
    await interaction.channel.send({
      embeds: [
        errorEmbed(
          `This ticket has been claimed by <@${interaction.member.id}>`,
        ),
      ],
    });

    await client.db.set(`guild_${interaction.guild.id}`, {
      ...guild,
      tickets,
    });
  },

  async handleUnclaimTicket(client, interaction, ticket) {
    if (interaction.member.id != ticket.status.split('-')[1]) {
      return await interaction.reply({
        embeds: [
          errorEmbed(
            'You are not the one who claimed this ticket, so you cannot unclaim it.',
          ),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    const guild =
      (await client.db.get(`guild_${interaction.guild.id}`)) || {};
    let tickets = guild?.tickets || [];
    tickets = tickets.filter((t) => t.channelId !== ticket.channelId);

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

    await interaction.message.edit({
      components: [components],
    });

    await interaction.deferUpdate();
    await interaction.channel.send({
      embeds: [
        successEmbed(
          `This ticket has been unclaimed by <@${interaction.member.id}>`,
        ),
      ],
    });

    ticket.status = 'open';
    tickets.push(ticket);

    await client.db.set(`guild_${interaction.guild.id}`, {
      ...guild,
      tickets,
    });
  },

  async handleCloseTicket(client, interaction, ticket) {
    if (
      ticket.status.startsWith('claimed') &&
      !isAdmin(interaction.member)
    ) {
      return await interaction.reply({
        embeds: [
          errorEmbed(
            'You are not an admin, and this ticket is currently claimed.',
          ),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    const guild =
      (await client.db.get(`guild_${interaction.guild.id}`)) || {};
    let tickets = guild?.tickets || [];
    tickets = tickets.filter((t) => t.channelId !== ticket.channelId);

    await interaction.message.edit({
      components: [],
    });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('ticket:reopen')
        .setLabel('Reopen Ticket')
        .setEmoji('♻️')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('ticket:transcript')
        .setLabel('Transcript')
        .setEmoji('📋')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('ticket:delete')
        .setLabel('Delete Ticket')
        .setEmoji('🗑️')
        .setStyle(ButtonStyle.Secondary),
    );

    await interaction.deferUpdate();
    await interaction.channel.send({
      embeds: [
        errorEmbed(
          `This ticket has been closed by <@${interaction.member.id}>`,
        ),
      ],
      components: [row],
    });

    ticket.status = 'closed';
    tickets.push(ticket);

    await client.db.set(`guild_${interaction.guild.id}`, {
      ...guild,
      tickets,
    });
  },

  async handleReopenTicket(client, interaction, ticket) {
    await interaction.deferUpdate();
    await interaction.message.edit({
      components: [],
    });

    const guild =
      (await client.db.get(`guild_${interaction.guild.id}`)) || {};
    let tickets = guild?.tickets || [];
    tickets = tickets.filter((t) => t.channelId !== ticket.channelId);

    ticket.status = 'open';
    tickets.push(ticket);

    const message = await interaction.channel.messages.fetch(
      ticket.messageId,
    );

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

    await message.edit({
      components: [components],
    });

    await interaction.channel.send({
      embeds: [
        successEmbed(
          `This ticket has been reopened by <@${interaction.member.id}>`,
        ),
      ],
    });

    await client.db.set(`guild_${interaction.guild.id}`, {
      ...guild,
      tickets,
    });
  },

  async handleTranscriptTicket(client, interaction, ticket) {
    const transcript = await createTranscript(interaction.channel, {
      limit: -1,
    });

    const embed = new EmbedBuilder()
      .setTitle('📋 Ticket Transcript')
      .setDescription(
        `Here is the transcript for the ticket <#${interaction.channel.id}>.`,
      )
      .setColor(colors.mainColor)
      .setTimestamp();

    try {
      await interaction.user.send({
        embeds: [embed],
        files: [transcript],
      });

      await interaction.reply({
        embeds: [
          successEmbed('I have sent you the transcript via DM.'),
        ],
        flags: MessageFlags.Ephemeral,
      });
    } catch (e) {
      return await interaction.reply({
        embeds: [
          errorEmbed(
            'I was unable to send you the transcript via DM. Please make sure your DMs are open and try again.',
          ),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
  },

  async handleDeleteTicket(client, interaction, ticket) {
    const guild =
      (await client.db.get(`guild_${interaction.guild.id}`)) || {};
    let tickets = guild?.tickets || [];

    tickets = tickets.filter((t) => t.channelId !== ticket.channelId);

    await client.db.set(`guild_${interaction.guild.id}`, {
      ...guild,
      tickets,
    });

    await interaction.deferUpdate();
    await interaction.channel.send({
      embeds: [
        errorEmbed('This ticket will be deleted in 3 seconds.'),
      ],
    });

    setTimeout(async () => {
      await interaction.channel.delete();
    }, 3000);
  },
};
