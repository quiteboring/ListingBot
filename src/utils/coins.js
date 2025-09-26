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

export const sendCoinsEmbed = async (interaction) => {
  const channel = interaction.options.getChannel('channel');

  if (!(channel instanceof BaseGuildTextChannel)) {
    await interaction.reply({
      embeds: [errorEmbed('Provided value is not a text channel.')],
      flags: MessageFlags.Ephemeral,
    });

    return;
  }

  const coinEmbed = new EmbedBuilder()
    .setTitle(`:coin: ${config.shopName} Coins`)
    .setDescription('Select an option below to get started!')
    .setFields([
      {
        name: 'Buy Prices',
        value: `Base Price: **${config.coinBuyPrices}**`,
        inline: true,
      },
      {
        name: '',
        value: '',
        inline: true,
      },
      {
        name: 'Sell Prices',
        value: `Base Price: **${config.coinSellPrices}**`,
        inline: true,
      },
    ])
    .setColor(config.mainColor);

  const buyCoins = new ButtonBuilder()
    .setCustomId('create_buy_coins_ticket')
    .setLabel('Buy Coins')
    .setStyle(ButtonStyle.Secondary)
    .setEmoji('🛒');

  const sellCoins = new ButtonBuilder()
    .setCustomId('create_sell_coins_ticket')
    .setLabel('Sell Coins')
    .setStyle(ButtonStyle.Secondary)
    .setEmoji('💰');

  await channel.send({
    embeds: [coinEmbed],
    components: [
      new ActionRowBuilder().addComponents(buyCoins, sellCoins),
    ],
  });
  await interaction.reply({
    embeds: [successEmbed('Successfully sent embed.')],
    flags: MessageFlags.Ephemeral,
  });
};
