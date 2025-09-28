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
import { logger } from '../utils/logger.js';

export default {
  name: 'interactionCreate',

  /**
   * @param {import("../bot/client").default} client
   * @param {import("discord.js").Interaction} interaction
   */
  async execute(client, interaction) {
    try {
      // validate interaction
      if (!interaction) {
        logger.warn('WizardSetup: Received null or undefined interaction');
        return;
      }

      if (
        !interaction.isChannelSelectMenu() &&
        !interaction.isRoleSelectMenu()
      )
        return;

      // validate guild context
      if (!interaction.guild) {
        logger.warn('WizardSetup: Interaction missing guild context');
        return;
      }

      const key = `setup_${interaction.guild.id}`;
      const message = interaction.message;

      let setupData;
      try {
        setupData = (await client.db.get(key)) || {};
      } catch (error) {
        logger.error('WizardSetup: Failed to get setup data from database:', error);
        await interaction.reply({
          embeds: [errorEmbed('Failed to access setup data. Please try again.')],
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

    const ensureCreator = async () => {
      try {
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
      } catch (error) {
        logger.error('Error in ensureCreator check:', error);
        return false;
      }
    };

    const updateStep = async (embedOpts, component) => {
      try {
        await interaction.deferUpdate();
        const embed = new EmbedBuilder()
          .setTitle(embedOpts.title)
          .setDescription(embedOpts.desc)
          .setColor(config.mainColor);

        await message.edit({
          embeds: [embed],
          components: component ? [component] : [],
        });
      } catch (error) {
        logger.error('Error updating wizard step:', error);
        throw error;
      }
    };

    const steps = {
      setup_ticket_category: async () => {
        try {
          if (!(await ensureCreator())) return;

          if (!interaction.values || interaction.values.length === 0) {
            await interaction.reply({
              embeds: [errorEmbed('Please select a category.')],
              flags: MessageFlags.Ephemeral,
            });
            return;
          }

          setupData.ticketCategory = interaction.values[0];

          try {
            await client.db.set(key, setupData);
          } catch (error) {
            logger.error('Failed to save ticket category to database:', error);
            await interaction.reply({
              embeds: [errorEmbed('Failed to save setup data. Please try again.')],
              flags: MessageFlags.Ephemeral,
            });
            return;
          }

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
        } catch (error) {
          logger.error('Error in setup_ticket_category step:', error);
        }
      },

      setup_listings_category: async () => {
        try {
          if (!(await ensureCreator())) return;

          if (!interaction.values || interaction.values.length === 0) {
            await interaction.reply({
              embeds: [errorEmbed('Please select a category.')],
              flags: MessageFlags.Ephemeral,
            });
            return;
          }

          setupData.listingsCategory = interaction.values[0];

          try {
            await client.db.set(key, setupData);
          } catch (error) {
            logger.error('Failed to save listings category to database:', error);
            await interaction.reply({
              embeds: [errorEmbed('Failed to save setup data. Please try again.')],
              flags: MessageFlags.Ephemeral,
            });
            return;
          }

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
        } catch (error) {
          logger.error('Error in setup_listings_category step:', error);
        }
      },

      setup_seller_roles: async () => {
        try {
          if (!(await ensureCreator())) return;

          if (!interaction.values || interaction.values.length === 0) {
            await interaction.reply({
              embeds: [errorEmbed('Please select at least one role.')],
              flags: MessageFlags.Ephemeral,
            });
            return;
          }

          setupData.sellerRoles = interaction.values;

          try {
            await client.db.set(key, setupData);
          } catch (error) {
            logger.error('Failed to save seller roles to database:', error);
            await interaction.reply({
              embeds: [errorEmbed('Failed to save setup data. Please try again.')],
              flags: MessageFlags.Ephemeral,
            });
            return;
          }

          try {
            await interaction.deferUpdate();

            await message.edit({
              embeds: [successEmbed('Successfully setup the server!')],
              components: [],
            });
          } catch (error) {
            logger.error('Failed to update message after setup completion:', error);
          }
        } catch (error) {
          logger.error('Error in setup_seller_roles step:', error);
        }
      },
    };

      if (steps[interaction.customId]) {
        await steps[interaction.customId]();
      }
    } catch (error) {
      logger.error('Error in wizard setup interaction:', error);

      try {
        const errorMessage = {
          embeds: [errorEmbed('An error occurred during setup. Please try again.')],
          flags: MessageFlags.Ephemeral,
        };

        if (interaction.deferred) {
          await interaction.editReply(errorMessage);
        } else if (interaction.replied) {
          await interaction.followUp(errorMessage);
        } else {
          await interaction.reply(errorMessage);
        }
      } catch (replyError) {
        logger.error('Failed to send error message in wizard setup:', replyError);
      }
    }
  },
};
