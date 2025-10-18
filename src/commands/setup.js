import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelSelectMenuBuilder,
  ChannelType,
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import {
  errorEmbed,
  infoEmbed,
  successEmbed,
} from '../utils/embeds.js';
import { logger } from '../utils/logger.js';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';
import colors from '../colors.js';

export default {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Setup your server with a user friendly wizard!')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((sub) =>
      sub
        .setName('emojis')
        .setDescription(
          'Upload emojis for the bot to use (owner only).',
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName('wizard')
        .setDescription(
          'Setup your server with a user friendly wizard.',
        ),
    ),

  /**
   * @param {import('../bot/client.js').default} client
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(client, interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand == 'emojis')
      return await this.setupEmojis(client, interaction);
    else return await this.setupWizard(client, interaction);
  },

  /**
   * @param {import('../bot/client.js').default} client
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async setupEmojis(client, interaction) {
    if (interaction.member.id != client.ownerId) {
      return await interaction.reply({
        embeds: [
          errorEmbed(
            'Only the owner of this bot can use this subcommand.',
          ),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      const emojis = (await client.db.get('emojis')) || {};
      const __dirname = path.dirname(fileURLToPath(import.meta.url));
      const assetsPath = path.resolve(__dirname, '../../assets');

      async function findImageFiles(dir) {
        let results = [];
        const entries = await fs.readdir(dir, {
          withFileTypes: true,
        });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            results = results.concat(await findImageFiles(fullPath));
          } else if (
            entry.isFile() &&
            (entry.name.endsWith('.png') ||
              entry.name.endsWith('.gif'))
          ) {
            results.push(fullPath);
          }
        }

        return results;
      }

      const files = await findImageFiles(assetsPath);

      if (!files.length) {
        return interaction.editReply({
          embeds: [errorEmbed('No images to upload.')],
        });
      }

      await interaction.editReply({
        embeds: [infoEmbed(`Processing ${files.length} images...`)],
      });

      let created = 0;
      let updated = 0;

      await interaction.guild.emojis.fetch();

      for (const filePath of files) {
        const ext = path.extname(filePath);
        const emojiName = path.basename(filePath, ext);
        const existing = interaction.guild.emojis.cache.find(
          (e) => e.name === emojiName,
        );

        if (existing) {
          emojis[existing.name] = existing.toString();
          updated++;
        } else {
          const emoji = await interaction.guild.emojis.create({
            attachment: filePath,
            name: emojiName,
          });

          emojis[emoji.name] = emoji.toString();
          created++;

          await new Promise((r) => setTimeout(r, 1000));
        }
      }

      await client.db.set('emojis', emojis);

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

  /**
   * @param {import('../bot/client.js').default} client
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async setupWizard(client, interaction) {
    const embed = new EmbedBuilder()
      .setTitle('Step 1/3 Select the ticket category')
      .setDescription(
        'The selected category is where tickets will be created.\n\nUse the dropdown to select a category.\n\n_Not seeing it? Try searching in the dropdown._',
      )
      .setColor(colors.mainColor);

    const selector = new ActionRowBuilder().addComponents(
      new ChannelSelectMenuBuilder()
        .setCustomId('setup:ticket_category')
        .setPlaceholder('Select a category')
        .setMaxValues(1)
        .setChannelTypes(ChannelType.GuildCategory),
    );

    const confirm = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('setup:confirm')
        .setLabel('Confirm')
        .setStyle(ButtonStyle.Success),
    );

    return interaction.reply({
      embeds: [embed],
      components: [selector, confirm],
      flags: MessageFlags.Ephemeral,
    });
  },
};
