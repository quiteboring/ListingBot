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
      embeds: [infoEmbed(`Uploading ${imageFiles.length} images...`)],
    });

    for (const file of imageFiles) {
      const filePath = path.join(assetsPath, file);
      const emojiName = path.basename(file, '.png');

      if (
        interaction.guild.emojis.cache.some(
          (e) => e.name === emojiName,
        )
      )
        continue;

      const newEmoji = await interaction.guild.emojis.create({
        attachment: filePath,
        name: emojiName,
      });

      await client.db.set(newEmoji.name, newEmoji.toString());
    }

    await interaction.editReply({
      embeds: [successEmbed('Successfully uploaded emojis!')],
    });
  } catch (error) {
    logger.error(error);

    await interaction.editReply({
      embeds: [errorEmbed('No permissions to upload.')],
    });
  }
};
