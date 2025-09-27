import config from '../config.js';
import { EmbedBuilder } from 'discord.js';

export const mainEmbed = (title) => {
  const embed = new EmbedBuilder()
    .setDescription(title)
    .setColor(config.mainColor);

  return embed;
};

export const successEmbed = (title) => {
  const embed = new EmbedBuilder()
    .setDescription(title)
    .setColor(config.successColor);

  return embed;
};

export const infoEmbed = (title) => {
  const embed = new EmbedBuilder()
    .setDescription(title)
    .setColor(config.infoColor);

  return embed;
};

export const errorEmbed = (title) => {
  const embed = new EmbedBuilder()
    .setDescription(title)
    .setColor(config.errorColor);

  return embed;
};
