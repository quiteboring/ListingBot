import { MessageFlags } from 'discord.js';

export default {
  name: 'interactionCreate',

  /**
   * @param {import("../bot/client").default} client
   * @param {import("discord.js").ChatInputCommandInteraction} interaction
   */
  async execute(client, interaction) {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(client, interaction);
    } catch (error) {
      const content = {
        content: 'i errored :/',
        flags: MessageFlags.Ephemeral,
      };

      console.log(error);

      if (interaction.deferred) {
        await interaction.editReply(content);
      } else {
        await interaction.reply(content);
      }
    }
  },
};
