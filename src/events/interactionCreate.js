import { MessageFlags } from 'discord.js';
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
        logger.warn('Received null or undefined interaction');
        return;
      }

      if (!interaction.isCommand()) return;

      // validate command
      const command = client.commands.get(interaction.commandName);
      if (!command) {
        logger.warn(`Unknown command attempted: ${interaction.commandName}`);
        return;
      }

      // validate command structure
      if (typeof command.execute !== 'function') {
        logger.error(`Command ${interaction.commandName} missing execute function`);
        await interaction.reply({
          content: 'This command is not properly configured.',
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      // execute command with error handling
      await command.execute(client, interaction);

    } catch (error) {
      logger.error(`Error executing command ${interaction?.commandName || 'unknown'}:`, error);

      const content = {
        content: 'There was an error executing this command. Try again later.',
        flags: MessageFlags.Ephemeral,
      };

      try {
        // handle different interaction states
        if (interaction.deferred) {
          await interaction.editReply(content);
        } else if (interaction.replied) {
          await interaction.followUp(content);
        } else {
          await interaction.reply(content);
        }
      } catch (replyError) {
        logger.error('Failed to send error message to user:', replyError);
      }
    }
  },
};
