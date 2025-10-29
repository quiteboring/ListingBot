import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { isSeller } from '../utils/checks.js';
import { errorEmbed, successEmbed } from '../utils/embeds.js';

export default {
  data: new SlashCommandBuilder()
    .setName('customer')
    .setDescription('Manage customers in your server')
    .addSubcommand((sub) =>
      sub
        .setName('add')
        .setDescription(
          'Allow sellers to add give a user a customer role',
        )
        .addMentionableOption((opt) =>
          opt
            .setName('user')
            .setDescription('A user in this discord server')
            .setRequired(true),
        ),
    ),

  /**
   * @param {import('../bot/client.js').default} client
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(client, interaction) {
    if (!(await isSeller(client, interaction.member))) {
      return await interaction.reply({
        embeds: [
          errorEmbed('Insufficient permissions to use this command.'),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    const sub = interaction.options.getSubcommand();
    const setup =
      (await client.db.get(`guild_${interaction.guild.id}`)) || {};

    switch (sub) {
      case 'add':
        const user = interaction.options.getMember('user');

        const customerRoleId = setup?.customer_role ?? 0;
        const role = await interaction.guild.roles.fetch(customerRoleId);

        if (!role) {
          return await interaction.reply({
            embeds: [errorEmbed('Invalid server setup.')]
          })
        }

        await user.roles.add(role);

        return await interaction.reply({
          embeds: [successEmbed(`Gave customer role to <@${user.id}>`)],
          flags: MessageFlags.Ephemeral,
        })
    }
  },
};
