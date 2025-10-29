import { EmbedBuilder, MessageFlags } from 'discord.js';
import { isAdmin } from '../../utils/checks.js';
import { errorEmbed } from '../../utils/embeds.js';
import { createTicket } from '../../utils/ticket/utils.js';
import colors from '../../utils/colors.js';

export default {
  name: 'interactionCreate',

  /**
   * @param {import("../bot/client").default} client
   * @param {import("discord.js").Interaction} interaction
   */
  async execute(client, interaction) {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith('account:')) return;

    const value = interaction.customId.split(':')[1];

    switch (value) {
      case 'buy':
        return this.handleBuyAccount(client, interaction);
      case 'unlist':
        return this.handleUnlist(client, interaction);
    }
  },

  async handleBuyAccount(client, interaction) {
    const setup =
      (await client.db.get(`guild_${interaction.guild.id}`)) || {};
    const category = setup.ticket_category;

    if (!category) {
      return await interaction.reply({
        embeds: [
          errorEmbed(
            'Ticket category is not set up. Please contact an administrator.',
          ),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    const listings = setup?.listings || [];
    const listing = listings.find(
      (item) =>
        item.channelId === interaction.channel.id &&
        item.messageId === interaction.message.id,
    );

    const embed = new EmbedBuilder()
      .setTitle('Buy Account Ticket')
      .setDescription(
        'Thank you for your interest in purchasing this account! A member of our team will be with you shortly to assist you with the purchase process. Please provide any necessary information or questions you may have in the ticket channel once it is created.',
      )
      .addFields([
        {
          name: 'Account of Interest',
          value: `<#${interaction.channel.id}>`,
        },
      ])
      .setColor(colors.mainColor)
      .setTimestamp();

    const channel = await createTicket(
      client,
      interaction,
      category,
      'account',
      embed,
      `<@${listing?.sellerId ?? 'unknown'}>, <@${interaction.user.id}> is looking to buy your account!`
    );

    await channel.send({
      embeds: [interaction.message.embeds[0]],
    });
  },

  async handleUnlist(client, interaction) {
    const setup =
      (await client.db.get(`guild_${interaction.guild.id}`)) || {};
    const listings = setup?.listings || [];
    const listing = listings.find(
      (item) =>
        item.channelId === interaction.channel.id &&
        item.messageId === interaction.message.id,
    );

    if (
      interaction.user.id !== listing.sellerId &&
      !isAdmin(interaction.member)
    ) {
      return await interaction.reply({
        embeds: [
          errorEmbed(
            'You do not have permission to unlist this account.',
          ),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    await client.db.set(`guild_${interaction.guild.id}`, {
      ...setup,
      listings: listings.filter(
        (item) =>
          item.channelId !== interaction.channel.id ||
          item.messageId !== interaction.message.id,
      ),
    });

    await interaction.reply({
      embeds: [
        errorEmbed(
          'Account unlisted successfully. Deleting channel in 3 seconds...',
        ),
      ],
      flags: MessageFlags.Ephemeral,
    });

    setTimeout(async () => {
      await interaction.channel.delete();
    }, 3000);
  },
};
