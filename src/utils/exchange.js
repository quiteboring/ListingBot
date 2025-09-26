import config from '../config.js';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  BaseGuildTextChannel,
  EmbedBuilder,
} from 'discord.js';
import { successEmbed, errorEmbed } from './embed.js';

export const sendExchangeEmbed = async (interaction) => {
  const channel = interaction.options.getChannel('channel');

  if (!(channel instanceof BaseGuildTextChannel)) {
    await interaction.reply({
      embeds: [errorEmbed('Provided value is not a text channel.')],
      flags: MessageFlags.Ephemeral,
    });

    return;
  }

  const exchangeEmbed = new EmbedBuilder()
    .setTitle(`:handshake: ${config.shopName} Exchanges`)
    .setDescription('Open a ticket for a currency exchange!')
    .setColor(config.mainColor);

  const openTicketButton = new ButtonBuilder()
    .setCustomId('create_exchange_ticket')
    .setLabel('Exchange')
    .setStyle(ButtonStyle.Secondary)
    .setEmoji('💸');

  await channel.send({
    embeds: [exchangeEmbed],
    components: [
      new ActionRowBuilder().addComponents(openTicketButton),
    ],
  });

  await interaction.reply({
    embeds: [successEmbed('Successfully sent embed.')],
    flags: MessageFlags.Ephemeral,
  });
};
