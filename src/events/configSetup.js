import { MessageFlags } from 'discord.js';
import { successEmbed } from '../utils/embed.js';

export default {
  name: 'interactionCreate',

  async execute(client, interaction) {
    if (!interaction.isModalSubmit()) return;

    const guildId = interaction.guild.id;
    const modalId = interaction.customId;

    const dbKey = `config_${guildId}`;
    const currentConfig = (await client.db.get(dbKey)) || {};

    switch (modalId) {
      case 'exchange_panel_config': {
        const details =
          interaction.fields.getTextInputValue('details');
        await client.db.set(dbKey, {
          ...currentConfig,
          exchangeDetails: details,
        });
        break;
      }

      case 'coins_panel_config': {
        const buy = interaction.fields.getTextInputValue('buy_price');
        const sell =
          interaction.fields.getTextInputValue('sell_price');
        await client.db.set(dbKey, {
          ...currentConfig,
          coinBuyPrice: buy,
          coinSellPrice: sell,
        });
        break;
      }

      case 'middleman_panel_config': {
        const details =
          interaction.fields.getTextInputValue('details');
        await client.db.set(dbKey, {
          ...currentConfig,
          middlemanDetails: details,
        });
        break;
      }

      case 'mfa_panel_config': {
        const mfaNon =
          interaction.fields.getTextInputValue('mfaNon') || null;
        const mfaVip =
          interaction.fields.getTextInputValue('mfaVip') || null;
        const mfaVipPlus =
          interaction.fields.getTextInputValue('mfaVipPlus') || null;
        const mfaMvp =
          interaction.fields.getTextInputValue('mfaMvp') || null;
        const mfaMvpPlus =
          interaction.fields.getTextInputValue('mfaMvpPlus') || null;

        await client.db.set(dbKey, {
          ...currentConfig,
          mfaNon,
          mfaVip,
          mfaVipPlus,
          mfaMvp,
          mfaMvpPlus,
        });
        break;
      }

      default:
        return;
    }

    await interaction.reply({
      embeds: [successEmbed('Configuration saved!')],
      flags: MessageFlags.Ephemeral,
    });
  },
};
