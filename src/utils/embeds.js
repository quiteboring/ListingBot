import colors from './utils/colors.js';
import { EmbedBuilder } from 'discord.js';

export const mainEmbed = (description) => {
  const embed = new EmbedBuilder()
    .setDescription(description)
    .setColor(colors.mainColor);

  return embed;
};

export const successEmbed = (description) => {
  const embed = new EmbedBuilder()
    .setDescription(description)
    .setColor(colors.successColor);

  return embed;
};

export const infoEmbed = (description) => {
  const embed = new EmbedBuilder()
    .setDescription(description)
    .setColor(colors.infoColor);

  return embed;
};

export const errorEmbed = (description) => {
  const embed = new EmbedBuilder()
    .setDescription(description)
    .setColor(colors.errorColor);

  return embed;
};
