import { MessageFlags, SlashCommandBuilder } from 'discord.js';
import { errorEmbed, successEmbed } from '../utils/embed.js';
import { showModal } from '../utils/tickets.js';
import { hasAdmin, isSeller } from '../utils/member.js';

export default {
  data: new SlashCommandBuilder()
    .setName('list')
    .setDescription('List an account for the server!')
    .addSubcommand((sub) =>
      sub
        .setName('create')
        .setDescription('Create an account listing!'),
    )
    .addSubcommand((sub) =>
      sub
        .setName('delete')
        .setDescription('Deletes an account listing!')
        .addChannelOption((opt) =>
          opt
            .setName('channel')
            .setDescription(
              'The listing channel where the account is listed.',
            ),
        ),
    ),

  /**
   * @param {import('../bot/client.js').default} client
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(client, interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub == 'create')
      return await this.createAccount(client, interaction);
    if (sub == 'delete')
      return await this.deleteAccount(client, interaction);
  },

  async createAccount(client, interaction) {
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
        embeds: [errorEmbed('You cannot use this command.')],
        flags: MessageFlags.Ephemeral,
      });
    }

    await showModal(
      interaction,
      [
        {
          customId: 'username',
          label: 'Minecraft IGN',
          placeholder: 'Refraction',
        },
        {
          customId: 'price',
          label: 'Starting Price',
          placeholder: '500',
        },
      ],
      'create_account_listing',
    );
  },

  async deleteAccount(client, interaction) {
    const listings =
      (await client.db.get(`accounts_${interaction.guild.id}`)) || [];

    const channel = interaction.options.getChannel('channel');

    const exists = listings.some(
      (listing) => listing.channel === channel.id,
    );

    if (!exists) {
      return interaction.reply({
        embeds: [errorEmbed('No account found.')],
        flags: MessageFlags.Ephemeral,
      });
    }

    const updatedListings = listings.filter(
      (listing) => listing.channel !== channel.id,
    );

    await client.db.set(
      `accounts_${interaction.guild.id}`,
      updatedListings,
    );

    return interaction.reply({
      embeds: [successEmbed('No account found.')],
      flags: MessageFlags.Ephemeral,
    });
  },
};
