import colors from '../colors.js';
import { EmbedBuilder } from 'discord.js';

export const mainEmbed = (title) => {
  const embed = new EmbedBuilder()
    .setDescription(title)
    .setColor(colors.mainColor);

  return embed;
};

export const successEmbed = (title) => {
  const embed = new EmbedBuilder()
    .setDescription(title)
    .setColor(colors.successColor);

  return embed;
};

export const infoEmbed = (title) => {
  const embed = new EmbedBuilder()
    .setDescription(title)
    .setColor(colors.infoColor);

  return embed;
};

export const errorEmbed = (title) => {
  const embed = new EmbedBuilder()
    .setDescription(title)
    .setColor(colors.errorColor);

  return embed;
};
