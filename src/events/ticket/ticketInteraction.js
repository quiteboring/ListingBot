import { MessageFlags } from 'discord.js';

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

  async handleClaimTicket(client, interaction, ticket) {},

  async handleUnclaimTicket(client, interaction, ticket) {},

  async handleCloseTicket(client, interaction, ticket) {},

  async handleReopenTicket(client, interaction, ticket) {},

  async handleTranscriptTicket(client, interaction, ticket) {},

  async handleDeleteTicket(client, interaction, ticket) {},
};
