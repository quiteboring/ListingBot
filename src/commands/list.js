import { MessageFlags, SlashCommandBuilder } from 'discord.js';
import { errorEmbed } from '../utils/embed.js';
import { showModal } from '../utils/tickets.js';

export default {
  data: new SlashCommandBuilder()
    .setName('list')
    .setDescription('List an account for the server!'),

  /**
   * @param {import('../bot/client.js').default} client
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(client, interaction) {
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
};
