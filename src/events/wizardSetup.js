import {
  ActionRowBuilder,
  ChannelSelectMenuBuilder,
  ChannelType,
  EmbedBuilder,
  MessageFlags,
  RoleSelectMenuBuilder,
} from 'discord.js';
import config from '../config.js';
import { errorEmbed, successEmbed } from '../utils/embed.js';

export default {
  name: 'interactionCreate',

  /**
   * @param {import("../bot/client").default} client
   * @param {import("discord.js").Interaction} interaction
   */
  async execute(client, interaction) {
    if (
      !interaction.isChannelSelectMenu() &&
      !interaction.isRoleSelectMenu()
    )
      return;

    const key = `setup_${interaction.guild.id}`;
    const message = interaction.message;
    const setupData = (await client.db.get(key)) || {};

    const ensureCreator = async () => {
      if (
        setupData.creatorId &&
        interaction.user.id !== setupData.creatorId
      ) {
        await interaction.reply({
          embeds: [
            errorEmbed(
              'Only the original setup creator can complete this wizard.',
            ),
          ],
          flags: MessageFlags.Ephemeral,
        });
        return false;
      }
      return true;
    };

    const updateStep = async (embedOpts, component) => {
      await interaction.deferUpdate();
      const embed = new EmbedBuilder()
        .setTitle(embedOpts.title)
        .setDescription(embedOpts.desc)
        .setColor(config.mainColor);

      await message.edit({
        embeds: [embed],
        components: component ? [component] : [],
      });
    };

    const steps = {
      setup_ticket_category: async () => {
        if (!(await ensureCreator())) return;

        setupData.ticketCategory = interaction.values[0];
        await client.db.set(key, setupData);

        await updateStep(
          {
            title: 'Step 2/3 — Select the listings category',
            desc:
              'The selected category is where account listings will be created.\n\n' +
              'Use the dropdown to select a category.\n\n' +
              '_Not seeing your category? Try searching in the dropdown_',
          },
          new ActionRowBuilder().addComponents(
            new ChannelSelectMenuBuilder()
              .setCustomId('setup_listings_category')
              .setPlaceholder('Select a category')
              .setChannelTypes(ChannelType.GuildCategory),
          ),
        );
      },

      setup_listings_category: async () => {
        if (!(await ensureCreator())) return;

        setupData.listingsCategory = interaction.values[0];
        await client.db.set(key, setupData);

        await updateStep(
          {
            title: 'Step 3/3 — Select the seller role(s)',
            desc:
              'These roles will have access to see ticket channels.\n\n' +
              'Use the dropdown to select the role(s).\n\n' +
              '_Not seeing your role? Try searching in the dropdown_',
          },
          new ActionRowBuilder().addComponents(
            new RoleSelectMenuBuilder()
              .setCustomId('setup_seller_roles')
              .setPlaceholder('Select role(s)')
              .setMinValues(1)
              .setMaxValues(3),
          ),
        );
      },

      setup_seller_roles: async () => {
        if (!(await ensureCreator())) return;

        setupData.sellerRoles = interaction.values;
        await client.db.set(key, setupData);
        await interaction.deferUpdate();

        await message.edit({
          embeds: [successEmbed('Successfully setup the server!')],
          components: [],
        });
      },
    };

    if (steps[interaction.customId]) {
      await steps[interaction.customId]();
    }
  },
};
