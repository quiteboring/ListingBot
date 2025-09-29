import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Guild,
  MessageFlags,
  TextChannel,
} from 'discord.js';
import { createTicket, showModal } from '../utils/tickets.js';
import { errorEmbed, successEmbed } from '../utils/embed.js';
import { createTranscript } from 'discord-html-transcripts';
import { hasAdmin, isSeller } from '../utils/member.js';

export default {
  name: 'interactionCreate',

  /**
   * @param {import("../bot/client").default} client
   * @param {import("discord.js").Interaction} interaction
   */
  async execute(client, interaction) {
    if (
      !interaction.isStringSelectMenu() &&
      !interaction.isButton() &&
      !interaction.isModalSubmit()
    )
      return;

    switch (interaction.customId) {
      case 'sell_coins_ticket':
      case 'buy_coins_ticket':
        return await this.handleCoinsTicket(client, interaction);
      case 'middleman_ticket':
        return await this.handleMiddlemanTicket(client, interaction);
      case 'exchange_ticket':
        return await this.handleExchangeTicket(client, interaction);
      case 'sell_account_ticket':
        return await this.handleSellAccountTicket(
          client,
          interaction,
        );
      case 'mfa_ticket':
        return await createTicket(client, interaction);
      case 'close_ticket':
        return await this.closeTicket(client, interaction);
      case 'reopen_ticket':
        return await this.reopenTicket(client, interaction);
      case 'delete_ticket':
        return await this.deleteTicket(client, interaction);
      case 'transcript_ticket':
        return await this.transcriptTicket(client, interaction);
      case 'claim_ticket':
        return await this.claimTicket(client, interaction);
      case 'unclaim_ticket':
        return await this.unclaimTicket(client, interaction);
    }
  },

  // General Button + Modal interactions
  async handleCoinsTicket(client, interaction) {
    if (interaction.isButton()) {
      await showModal(interaction, [
        {
          customId: 'username',
          label: 'Minecraft Username',
          placeholder: 'Refraction',
        },
        {
          customId: 'method',
          label: 'Method of Payment',
          placeholder: 'LTC',
        },
        {
          customId: 'amount',
          label: 'Amount of Coins',
          placeholder: '100m',
        },
      ]);
    } else if (interaction.isModalSubmit()) {
      await createTicket(client, interaction);
    }
  },

  async handleMiddlemanTicket(client, interaction) {
    if (interaction.isButton()) {
      await showModal(interaction, [
        {
          customId: 'user_id',
          label: 'ID of other Person',
          placeholder: 'ex: 1367543367277219840',
        },
        {
          customId: 'details',
          label: 'Details',
          placeholder: 'Type here...',
        },
      ]);
    } else if (interaction.isModalSubmit()) {
      await createTicket(client, interaction);
    }
  },

  async handleExchangeTicket(client, interaction) {
    if (interaction.isButton()) {
      await showModal(interaction, [
        {
          customId: 'currency_from',
          label: 'Currency From',
          placeholder: 'LTC',
        },
        {
          customId: 'currency_to',
          label: 'Currency To',
          placeholder: 'PayPal',
        },
        {
          customId: 'amount',
          label: 'Amount',
          placeholder: '100$',
        },
      ]);
    } else if (interaction.isModalSubmit()) {
      await createTicket(client, interaction);
    }
  },

  async handleSellAccountTicket(client, interaction) {
    if (interaction.isButton()) {
      await showModal(interaction, [
        {
          customId: 'username',
          label: 'Minecraft Username',
          placeholder: 'Refraction',
        },
        {
          customId: 'asking_price',
          label: 'Asking Price',
          placeholder: 'PayPal',
        },
      ]);
    } else if (interaction.isModalSubmit()) {
      await createTicket(client, interaction);
    }
  },

  // Within ticket handling
  async closeTicket(client, interaction) {
    if (!isSeller(client, interaction) && !hasAdmin(interaction)) {
      await interaction.reply({
        embeds: [
          errorEmbed(
            'You do not have permissions to close the ticket.',
          ),
        ],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const channel = interaction.channel;
    const key = `ticket_${interaction.guild.id}_${channel.id}`;
    const ticket = await client.db.get(key);

    if (!ticket || !ticket.creatorId) {
      return interaction.reply({
        embeds: [errorEmbed('Ticket data not found.')],
        flags: MessageFlags.Ephemeral,
      });
    }

    await channel.permissionOverwrites.edit(ticket.creatorId, {
      ViewChannel: false,
      SendMessages: false,
      ReadMessageHistory: false,
    });

    if (ticket.middlemanId) {
      await channel.permissionOverwrites.edit(ticket.middlemanId, {
        ViewChannel: false,
        SendMessages: false,
        ReadMessageHistory: false,
      });
    }

    ticket.status = 'closed';
    const msg = await channel.messages.fetch(ticket.message);

    await client.db.set(key, ticket);
    await interaction.deferUpdate();

    await msg.edit({ components: [] });

    await channel.send({
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
            .setCustomId('transcript_ticket')
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
  },

  async reopenTicket(client, interaction) {
    if (!isSeller(client, interaction) && !hasAdmin(interaction)) {
      await interaction.reply({
        embeds: [
          errorEmbed(
            'You do not have permissions to reopen the ticket.',
          ),
        ],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const channel = interaction.channel;
    const key = `ticket_${interaction.guild.id}_${channel.id}`;
    const ticket = await client.db.get(key);
    const msg = interaction.message;
    const ticketMsg = await channel.messages.fetch(ticket.message);

    if (!ticket || !ticket.creatorId) {
      return interaction.reply({
        embeds: [errorEmbed('Ticket data not found.')],
        flags: MessageFlags.Ephemeral,
      });
    }

    await channel.permissionOverwrites.edit(ticket.creatorId, {
      ViewChannel: true,
      SendMessages: true,
      ReadMessageHistory: true,
    });

    if (ticket.middlemanId) {
      await channel.permissionOverwrites.edit(ticket.middlemanId, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true,
      });
    }

    ticket.status = 'open';
    await client.db.set(key, ticket);
    await interaction.deferUpdate();

    await channel.send({
      embeds: [
        successEmbed(`Ticket reopened by <@${interaction.user.id}>`),
      ],
    });

    await msg.edit({ components: [] });

    await ticketMsg.edit({
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
  },

  async deleteTicket(client, interaction) {
    if (!isSeller(client, interaction) && !hasAdmin(interaction)) {
      await interaction.reply({
        embeds: [
          errorEmbed(
            'You do not have permissions to delete the ticket.',
          ),
        ],
        flags: MessageFlags.Ephemeral,
      });

      return;
    }

    await interaction.reply({
      embeds: [errorEmbed('Deleting channel in 3 seconds.')],
      flags: MessageFlags.Ephemeral,
    });

    setTimeout(async () => {
      await client.db.delete(
        `ticket_${interaction.guild.id}_${interaction.channel.id}`,
      );
      await interaction.channel.delete();
    }, 3000);
  },

  async transcriptTicket(client, interaction) {
    if (!isSeller(client, interaction) && !hasAdmin(interaction)) {
      await interaction.reply({
        embeds: [
          errorEmbed(
            'You do not have permissions to generate a transcript.',
          ),
        ],
        flags: MessageFlags.Ephemeral,
      });

      return;
    }

    const transcript = await createTranscript(interaction.channel, {
      limit: -1,
    });

    await interaction.reply({
      files: [transcript],
      flags: MessageFlags.Ephemeral,
    });
  },

  async claimTicket(client, interaction) {
    const channel = interaction.channel;
    const key = `ticket_${interaction.guild.id}_${channel.id}`;
    const ticket = await client.db.get(key);

    if (!ticket) {
      return interaction.reply({
        embeds: [errorEmbed('Ticket data not found.')],
        flags: MessageFlags.Ephemeral,
      });
    }

    const isSellerUser = await isSeller(client, interaction);

    if (
      (!isSellerUser && !hasAdmin(interaction)) ||
      ticket.claimedBy != 'none'
    ) {
      await interaction.reply({
        embeds: [errorEmbed('You cannot claim this ticket.')],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    ticket.claimedBy = interaction.user.id;
    await client.db.set(key, ticket);

    await interaction.deferUpdate();
    await channel.send({
      embeds: [
        successEmbed(`Ticket claimed by <@${ticket.claimedBy}>`),
      ],
    });
  },

  async unclaimTicket(client, interaction) {
    const channel = interaction.channel;
    const key = `ticket_${interaction.guild.id}_${channel.id}`;
    const ticket = await client.db.get(key);

    if (!ticket) {
      return interaction.reply({
        embeds: [errorEmbed('Ticket data not found.')],
        flags: MessageFlags.Ephemeral,
      });
    }

    const isSellerUser = await isSeller(client, interaction);
    if (
      (!isSellerUser && !hasAdmin(interaction)) ||
      ticket.claimedBy != interaction.user.id
    ) {
      await interaction.reply({
        embeds: [errorEmbed('You cannot unclaim this ticket.')],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    ticket.claimedBy = 'none';
    await client.db.set(key, ticket);

    await interaction.deferUpdate();
    await channel.send({
      embeds: [
        errorEmbed(`Ticket unclaimed by <@${interaction.user.id}>`),
      ],
    });
  },
};
