import { MessageFlags, SlashCommandBuilder } from 'discord.js';
import { errorEmbed, successEmbed } from '../utils/embeds.js';
import { generateMainEmbed } from '../utils/listing/embed.js';
import { isSeller } from '../utils/checks.js';
import { createListing } from '../utils/listing/utils.js';

export default {
  data: new SlashCommandBuilder()
    .setName('list')
    .setDescription('List an account!')
    .addStringOption((opt) =>
      opt
        .setName('ign')
        .setDescription('The IGN (ex: 56ms) of the account.'),
    )
    .addStringOption((opt) =>
      opt
        .setName('price')
        .setDescription('The listing price of the account.'),
    ),

  /**
   * @param {import('../bot/client.js').default} client
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(client, interaction) {
    if (!isSeller(client, interaction.member)) {
      return await interaction.reply({
        embeds: [
          errorEmbed('Insufficient permissions to use this command.'),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const ign = interaction.options.getString('ign');
    const price = interaction.options.getString('price');

    try {
      const setup =
        (await client.db.get(`guild_${interaction.guild.id}`)) || {};

      const category = setup.account_category;

      if (!category) {
        return await interaction.editReply({
          embeds: [
            errorEmbed(
              'Listing category is not set up. Please contact an administrator.',
            ),
          ],
        });
      }

      const embed = await generateMainEmbed(client, interaction, ign);
      const paymentMethod =
        (await client.db.get(
          `user_${interaction.user.id}_payment_methods`,
        )) || 'Unknown';

      embed.addFields([
        {
          name: '',
          value: '',
          inline: true,
        },
        {
          name: '💵 Price',
          value: price,
          inline: true,
        },
        {
          name: '💳 Payment Methods',
          value: paymentMethod,
          inline: true,
        },
      ]);

      await createListing(
        client,
        interaction,
        category,
        ign,
        price,
        embed,
      );

      await interaction.editReply({
        embeds: [successEmbed('Account listed successfully!')],
      });
    } catch (err) {
      console.log(err);

      await interaction.editReply({
        embeds: [errorEmbed('Error: ' + err)],
      });
    }
  },
};
