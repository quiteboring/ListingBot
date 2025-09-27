import { MessageFlags, ChannelType, EmbedBuilder, ActionRowBuilder, ChannelSelectMenuBuilder, RoleSelectMenuBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { logger } from '../utils/logger.js';
import config from '../config.js';
import { errorEmbed, successEmbed } from '../utils/embed.js';
import {
  handleDetailsSubmission,
  sendDetailsModal,
} from '../utils/panel/panelDetails.js';

export default {
  name: 'interactionCreate',

  /**
   * @param {import("../bot/client").default} client
   * @param {import("discord.js").Interaction} interaction
   */
  async execute(client, interaction) {
    try {
      // slash commands
      if (interaction.isCommand()) {
        return await this.handleSlashCommand(client, interaction);
      }

      // button interactions for panel builder
      if (interaction.isButton()) {
        return await this.handleButtonInteraction(client, interaction);
      }

      // modal submissions for panel builder
      if (interaction.isModalSubmit()) {
        return await this.handleModalSubmit(client, interaction);
      }

      // select menu interactions for setup wizard
      if (interaction.isChannelSelectMenu() || interaction.isRoleSelectMenu()) {
        return await this.handleSelectMenuInteraction(client, interaction);
      }
    } catch (error) {
      logger.error('Interaction error:', error);

      const content = {
        content: 'An error occurred while processing your request.',
        flags: MessageFlags.Ephemeral,
      };

      try {
        if (interaction.deferred) {
          await interaction.editReply(content);
        } else if (!interaction.replied) {
          await interaction.reply(content);
        }
      } catch (replyError) {
        logger.error('Failed to send error message:', replyError);
      }
    }
  },

  /**
   * @param {import("../bot/client").default} client
   * @param {import("discord.js").ChatInputCommandInteraction} interaction
   */
  async handleSlashCommand(client, interaction) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(client, interaction);
    } catch (error) {
      const content = {
        content: 'Command execution failed.',
        flags: MessageFlags.Ephemeral,
      };

      logger.error(`Command error in ${interaction.commandName}:`, error);

      try {
        if (interaction.deferred) {
          await interaction.editReply(content);
        } else if (!interaction.replied) {
          await interaction.reply(content);
        }
      } catch (replyError) {
        logger.error('Failed to send command error message:', replyError);
      }
    }
  },

  /**
   * @param {import("../bot/client").default} client
   * @param {import("discord.js").ButtonInteraction} interaction
   */
  async handleButtonInteraction(client, interaction) {
    const msg = interaction.message;

    switch (interaction.customId) {
      case 'set_panel_details':
        await sendDetailsModal(client, interaction);
        break;
      case 'add_button':
        // TODO: Implement add button functionality
        await interaction.reply({
          content: 'Add button functionality not yet implemented.',
          flags: MessageFlags.Ephemeral,
        });
        break;
      case 'remove_button':
        // TODO: Implement remove button functionality
        await interaction.reply({
          content: 'Remove button functionality not yet implemented.',
          flags: MessageFlags.Ephemeral,
        });
        break;
      case 'add_question':
        // TODO: Implement add question functionality
        await interaction.reply({
          content: 'Add question functionality not yet implemented.',
          flags: MessageFlags.Ephemeral,
        });
        break;
      case 'remove_question':
        // TODO: Implement remove question functionality
        await interaction.reply({
          content: 'Remove question functionality not yet implemented.',
          flags: MessageFlags.Ephemeral,
        });
        break;
      case 'next_step':
        // TODO: Implement next step functionality
        await interaction.reply({
          content: 'Next step functionality not yet implemented.',
          flags: MessageFlags.Ephemeral,
        });
        break;
      default:
        return;
    }
  },

  /**
   * @param {import("../bot/client").default} client
   * @param {import("discord.js").ModalSubmitInteraction} interaction
   */
  async handleModalSubmit(client, interaction) {
    switch (interaction.customId) {
      case 'set_panel_details':
        await handleDetailsSubmission(client, interaction);
        break;
      case 'add_button':
        // TODO: Implement add button modal functionality
        await interaction.reply({
          content: 'Add button modal functionality not yet implemented.',
          flags: MessageFlags.Ephemeral,
        });
        break;
      case 'remove_button':
        // TODO: Implement remove button modal functionality
        await interaction.reply({
          content: 'Remove button modal functionality not yet implemented.',
          flags: MessageFlags.Ephemeral,
        });
        break;
      case 'add_question':
        // TODO: Implement add question modal functionality
        await interaction.reply({
          content: 'Add question modal functionality not yet implemented.',
          flags: MessageFlags.Ephemeral,
        });
        break;
      case 'remove_question':
        // TODO: Implement remove question modal functionality
        await interaction.reply({
          content: 'Remove question modal functionality not yet implemented.',
          flags: MessageFlags.Ephemeral,
        });
        break;
      default:
        return;
    }
  },

  /**
   * @param {import("../bot/client").default} client
   * @param {import("discord.js").SelectMenuInteraction} interaction
   */
  async handleSelectMenuInteraction(client, interaction) {
    const key = `setup_${interaction.guild.id}`;
    const message = interaction.message;
    const setupData = (await client.db.get(key)) || {};

    // check if user is the setup creator
    if (setupData.creatorId && interaction.user.id !== setupData.creatorId) {
      await interaction.reply({
        embeds: [
          errorEmbed('Only the original setup creator can complete this wizard.'),
        ],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

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
        const selectedChannelId = interaction.values[0];
        const channel = interaction.guild.channels.cache.get(selectedChannelId);

        // validate channel exists and user can access it
        if (!channel) {
          await interaction.reply({
            embeds: [errorEmbed('Selected channel not found.')],
            flags: MessageFlags.Ephemeral,
          });
          return;
        }

        // check if user has permission to manage the selected channel
        if (!channel.permissionsFor(interaction.user)?.has('ManageChannels')) {
          await interaction.reply({
            embeds: [errorEmbed('You do not have permission to manage the selected channel.')],
            flags: MessageFlags.Ephemeral,
          });
          return;
        }

        setupData.ticketCategory = selectedChannelId;
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
        const selectedChannelId = interaction.values[0];
        const channel = interaction.guild.channels.cache.get(selectedChannelId);

        // validate channel exists and user can access it
        if (!channel) {
          await interaction.reply({
            embeds: [errorEmbed('Selected channel not found.')],
            flags: MessageFlags.Ephemeral,
          });
          return;
        }

        // check if user has permission to manage the selected channel
        if (!channel.permissionsFor(interaction.user)?.has('ManageChannels')) {
          await interaction.reply({
            embeds: [errorEmbed('You do not have permission to manage the selected channel.')],
            flags: MessageFlags.Ephemeral,
          });
          return;
        }

        setupData.listingsCategory = selectedChannelId;
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
        // validate that user has permission to manage selected roles
        for (const roleId of interaction.values) {
          const role = interaction.guild.roles.cache.get(roleId);
          if (!role) {
            await interaction.reply({
              embeds: [errorEmbed('One or more selected roles not found.')],
              flags: MessageFlags.Ephemeral,
            });
            return;
          }

          // check if user has permission to manage this role
          if (!role.permissions.has('ManageRoles') && role.position >= interaction.member.roles.highest.position) {
            await interaction.reply({
              embeds: [errorEmbed('You do not have permission to manage one or more selected roles.')],
              flags: MessageFlags.Ephemeral,
            });
            return;
          }
        }

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
