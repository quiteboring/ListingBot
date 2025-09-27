import {
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { sendExchangeEmbed } from '../utils/exchange.js';
import { sendCoinsEmbed } from '../utils/coins.js';
import { saveTicketsCategory } from '../utils/ticket.js';
import { uploadEmojis } from '../utils/emojis.js';
import { successEmbed } from '../utils/embed.js';

export default {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Setup the bot to be used in your server!')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((sub) =>
      sub
        .setName('emojis')
        .setDescription(
          'Upload a list of emojis to a server! (typically separate from your main server)',
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName('exchange')
        .setDescription('Send exchange embed in a specific channel')
        .addChannelOption((input) =>
          input
            .setName('channel')
            .setDescription('The channel of where to send embed.')
            .setRequired(true),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName('seller')
        .setDescription('Set the seller role.')
        .addRoleOption((input) =>
          input
            .setName('role')
            .setDescription("The seller's role.")
            .setRequired(true),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName('coins')
        .setDescription('Send coins embed in a specific channel.')
        .addChannelOption((input) =>
          input
            .setName('channel')
            .setDescription('The channel of where to send embed.')
            .setRequired(true),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName('accounts')
        .setDescription('Set the category for listing accounts.')
        .addChannelOption((input) =>
          input
            .setName('category')
            .setDescription('The category to list accounts in.')
            .setRequired(true),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName('tickets')
        .setDescription('Set the category for tickets.')
        .addChannelOption((input) =>
          input
            .setName('category')
            .setDescription('The category to create tickets in.')
            .setRequired(true),
        ),
    ),

  /**
   * @param {import('../bot/client.js').default} client
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(client, interaction) {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case 'emojis':
        await uploadEmojis(client, interaction);
        break;
      case 'coins':
        await sendCoinsEmbed(interaction);
        break;
      case 'exchange':
        await sendExchangeEmbed(interaction);
        break;
      case 'tickets':
        await saveTicketsCategory(client, interaction);
        break;
      case 'accounts':
        await saveTicketsCategory(client, interaction);
        break;
      case 'seller':
        const role = interaction.options.getRole('seller');
        await client.db.set('seller_role', role.id);
        await interaction.reply({
          embeds: [
            successEmbed(
              `Succesfully set seller role to id: ${role.id}`,
            ),
          ],
          flags: MessageFlags.Ephemeral,
        });

        break;
    }
  },
};
