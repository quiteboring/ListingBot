import {
  ActionRowBuilder,
  ChannelSelectMenuBuilder,
  ChannelType,
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import {
  errorEmbed,
  successEmbed,
  infoEmbed,
} from '../utils/embed.js';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger.js';
import config from '../config.js';
import path from 'path';
import fs from 'fs/promises';

export default {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Setup the bot to be used in your server!')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((sub) =>
      sub
        .setName('emojis')
        .setDescription('Upload emojis from assets to the server'),
    )
    .addSubcommand((sub) =>
      sub
        .setName('wizard')
        .setDescription('User friendly setup for your server!'),
    ),

  /**
   * @param {import('../bot/client.js').default} client
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(client, interaction) {
    const sub = interaction.options.getSubcommand();
    if (sub === 'emojis')
      return this.handleEmojis(client, interaction);
    if (sub === 'wizard')
      return this.handleWizard(client, interaction);
  },

  async handleEmojis(client, interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      const __dirname = path.dirname(fileURLToPath(import.meta.url));
      const assetsPath = path.resolve(__dirname, '../../assets');
      const files = (await fs.readdir(assetsPath)).filter((f) =>
        f.endsWith('.png'),
      );

      if (!files.length) {
        return interaction.editReply({
          embeds: [errorEmbed('No images to upload.')],
        });
      }

      await interaction.editReply({
        embeds: [infoEmbed(`Processing ${files.length} images...`)],
      });

      let created = 0,
        updated = 0;
      for (const file of files) {
        const emojiName = path.basename(file, '.png');
        const filePath = path.join(assetsPath, file);
        const existing = interaction.guild.emojis.cache.find(
          (e) => e.name === emojiName,
        );

        if (existing) {
          await client.db.set(existing.name, existing.toString());
          updated++;
        } else {
          const emoji = await interaction.guild.emojis.create({
            attachment: filePath,
            name: emojiName,
          });
          await client.db.set(emoji.name, emoji.toString());
          created++;

          // rate limiting
          if (created % 5 === 0) {
            await new Promise((r) => setTimeout(r, 1000));
          } else {
            await new Promise((r) => setTimeout(r, 200));
          }
        }
      }

      return interaction.editReply({
        embeds: [
          successEmbed(
            `Sync complete! Created: ${created}, Updated: ${updated}.`,
          ),
        ],
      });
    } catch (err) {
      logger.error(err);
      return interaction.editReply({
        embeds: [errorEmbed('No permissions to upload.')],
      });
    }
  },

  async handleWizard(client, interaction) {
    const key = `setup_${interaction.guild.id}`;
    await client.db.set(key, { creatorId: interaction.user.id });

    const embed = new EmbedBuilder()
      .setTitle('Step 1/3 Select the ticket category')
      .setDescription(
        'The selected category is where tickets will be created.\n\nUse the dropdown to select a category.\n\n_Not seeing it? Try searching in the dropdown._',
      )
      .setColor(config.mainColor);

    const selector = new ActionRowBuilder().addComponents(
      new ChannelSelectMenuBuilder()
        .setCustomId('setup_ticket_category')
        .setPlaceholder('Select a category')
        .setChannelTypes(ChannelType.GuildCategory),
    );

    return interaction.reply({
      embeds: [embed],
      components: [selector],
    });
  },
};
