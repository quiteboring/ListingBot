import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
} from 'discord.js';
import config from '../config.js';

export default {
  data: new SlashCommandBuilder()
    .setName('panel')
    .setDescription(
      'Useful subcommands for configuring your own custom panel!',
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((sub) =>
      sub.setName('create').setDescription('Create a coin panel!'),
    ),

  /**
   * @param {import('../bot/client.js').default} client
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(client, interaction) {
    const subcommand = interaction.options.getSubcommand();
    if (subcommand == 'create')
      return await this.createPanel(client, interaction);
  },

  /**
   * @param {import('../bot/client.js').default} client
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async createPanel(client, interaction) {
    const embed = new EmbedBuilder()
      .setTitle('Step 1/3 Set the panel details')
      .setDescription(
        'This will be the name of the panel (used for tickets).\n\nClick the button to set up panel details.\n\n_The panel will be created in this channel._',
      )
      .setColor(config.mainColor);

    const preview = new EmbedBuilder()
      .setTitle('Title')
      .setDescription('Description')
      .setColor(config.mainColor);

    const selector = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('set_panel_details')
        .setStyle(ButtonStyle.Secondary)
        .setLabel('Set Details')
        .setEmoji('🪪'),
    );

    await interaction.reply({
      embeds: [embed, preview],
      components: [selector],
    });
  },
};
