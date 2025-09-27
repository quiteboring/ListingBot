import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { MessageFlags } from 'discord.js';
import { errorEmbed, infoEmbed, successEmbed } from './embed.js';
import { logger } from './logger.js';

export const uploadEmojis = async (client, interaction) => {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  try {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const assetsPath = path.resolve(__dirname, '../../assets');
    const imageFiles = (await fs.readdir(assetsPath)).filter((file) =>
      file.endsWith('.png'),
    );

    if (imageFiles.length === 0) {
      await interaction.editReply({
        embeds: [errorEmbed('No images to upload.')],
      });
      return;
    }

    await interaction.editReply({
      embeds: [infoEmbed(`Processing ${imageFiles.length} images...`)],
    });

    let createdCount = 0;
    let updatedCount = 0;

    for (const file of imageFiles) {
      const filePath = path.join(assetsPath, file);
      const emojiName = path.basename(file, '.png');

      const existingEmoji = interaction.guild.emojis.cache.find(
        (e) => e.name === emojiName,
      );

      if (existingEmoji) {
        await client.db.set(existingEmoji.name, existingEmoji.toString());
        updatedCount++;
      } else {
        const newEmoji = await interaction.guild.emojis.create({
          attachment: filePath,
          name: emojiName,
        });

        await client.db.set(newEmoji.name, newEmoji.toString());
        createdCount++;
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    await interaction.editReply({
      embeds: [
        successEmbed(
          `Sync complete! Created: ${createdCount}, Updated: ${updatedCount}.`,
        ),
      ],
    });
  } catch (error) {
    logger.error(error);

    await interaction.editReply({
      embeds: [errorEmbed('No permissions to upload.')],
    });
  }
};
