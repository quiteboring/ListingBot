import {
  ActionRowBuilder,
  ChannelSelectMenuBuilder,
  ChannelType,
  Collection,
  EmbedBuilder,
  RoleSelectMenuBuilder,
} from 'discord.js';
import colors from '../../colors.js';
import { successEmbed } from '../../utils/embeds.js';

const data = new Collection();

export default {
  name: 'interactionCreate',

  /**
   * @param {import("../bot/client").default} client
   * @param {import("discord.js").Interaction} interaction
   */
  async execute(client, interaction) {
    if (
      !interaction.customId ||
      !interaction.customId.startsWith('setup:')
    )
      return;

    if (interaction.isChannelSelectMenu()) {
      const id = interaction.customId.split(':')[1];

      data.set(`${interaction.message.id}_${interaction.user.id}`, {
        id: id,
        values: interaction.values,
      });

      await interaction.deferUpdate();
      return;
    }

    if (interaction.isRoleSelectMenu()) {
      const id = interaction.customId.split(':')[1];

      data.set(`${interaction.message.id}_${interaction.user.id}`, {
        id: id,
        values: interaction.values,
      });

      await interaction.deferUpdate();
      return;
    }

    if (!interaction.isButton()) return;
    if (interaction.customId !== 'setup:confirm') return;
    
    const value = data.get(
      `${interaction.message.id}_${interaction.user.id}`,
    );

    if (value.values && value.values.length === 0) {
      return await interaction.update({
        embeds: [
          errorEmbed(
            'Please select at least one option from the menu.',
          ),
        ],
        ephemeral: true,
      });
    }

    switch (value.id) {
      case 'ticket_category':
        await this.updateTicketCategory(
          client,
          interaction,
          value.values,
        );
        break;
      case 'account_category':
        await this.updateAccountCategory(
          client,
          interaction,
          value.values,
        );
        break;
      case 'profile_category':
        await this.updateProfileCategory(
          client,
          interaction,
          value.values,
        );
        
        break;
      case 'seller_roles':
        return await this.updateSellerRoles(
          client,
          interaction,
          value.values,
        );
    }
  },

  async updateTicketCategory(client, interaction, values) {
    const settings =
      (await client.db.get(`guild_${interaction.guild.id}`)) || {};
    settings.ticket_category = values[0];

    const embed = new EmbedBuilder()
      .setTitle('Step 2/4 Select the account category')
      .setDescription(
        'The selected category is where accounts will be listed.\n\nUse the dropdown to select a category.\n\n_Not seeing it? Try searching in the dropdown._',
      )
      .setColor(colors.mainColor);

    const selector = new ActionRowBuilder().addComponents(
      new ChannelSelectMenuBuilder()
        .setCustomId('setup:account_category')
        .setPlaceholder('Select a category')
        .setMaxValues(1)
        .setChannelTypes(ChannelType.GuildCategory),
    );

    const confirm = interaction.message.components[1];

    await interaction.update({
      embeds: [embed],
      components: [selector, confirm],
    });

    await client.db.set(
      `guild_${interaction.guild.id}`,
      settings,
    );
  },

  async updateAccountCategory(client, interaction, values) {
    const settings =
      (await client.db.get(`guild_${interaction.guild.id}`)) || {};
    settings.account_category = values[0];

    const embed = new EmbedBuilder()
      .setTitle('Step 3/4 Select the profile category')
      .setDescription(
        'The selected category is where profiles will be listed.\n\nUse the dropdown to select a category.\n\n_Not seeing it? Try searching in the dropdown._',
      )
      .setColor(colors.mainColor);

    const selector = new ActionRowBuilder().addComponents(
      new ChannelSelectMenuBuilder()
        .setCustomId('setup:profile_category')
        .setPlaceholder('Select a category')
        .setMaxValues(1)
        .setChannelTypes(ChannelType.GuildCategory),
    );

    const confirm = interaction.message.components[1];

    await interaction.update({
      embeds: [embed],
      components: [selector, confirm],
    });

    await client.db.set(
      `guild_${interaction.guild.id}`,
      settings,
    );
  },

  async updateProfileCategory(client, interaction, values) {
    const settings =
      (await client.db.get(`guild_${interaction.guild.id}`)) || {};
    settings.profile_category = values[0];

    const embed = new EmbedBuilder()
      .setTitle('Step 4/4 Select seller roles')
      .setDescription(
        'Select the roles that will have seller permissions.\n\nUse the dropdown to select roles.\n\n_Not seeing it? Try searching in the dropdown._',
      )
      .setColor(colors.mainColor);

    const selector = new ActionRowBuilder().addComponents(
      new RoleSelectMenuBuilder()
        .setCustomId('setup:seller_roles')
        .setPlaceholder('Select roles'),
    );

    const confirm = interaction.message.components[1];

    await interaction.update({
      embeds: [embed],
      components: [selector, confirm],
    });

    await client.db.set(
      `guild_${interaction.guild.id}`,
      settings,
    );
  },

  async updateSellerRoles(client, interaction, values) {
    const settings =
      (await client.db.get(`guild_${interaction.guild.id}`)) || {};
    settings.seller_roles = values;

    await interaction.update({
      embeds: [successEmbed('Setup complete!')],
      components: [],
    });

    await client.db.set(
      `guild_${interaction.guild.id}`,
      settings,
    );
  },
};
