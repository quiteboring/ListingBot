import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('value')
    .setDescription('Estimate a value for an account')
    .addStringOption((opt) =>
      opt
        .setName('ign')
        .setDescription('IGN of a Hypixel Skyblock player'),
    )
    .addBooleanOption((opt) =>
      opt
        .setName('lowball')
        .setDescription('Return a lowball of original value'),
    ),

  /**
   * @param {import('../bot/client.js').default} client
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(client, interaction) {},
};
