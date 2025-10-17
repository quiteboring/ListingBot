import { successEmbed, errorEmbed } from '../../utils/embeds.js';
import { Collection, MessageFlags } from 'discord.js';

const selectedPaymentMethods = new Collection();

export default {
  name: 'interactionCreate',

  /**
   * @param {import('../../bot/client.js').default} client
   * @param {import('discord.js').Interaction} interaction
   */
  async execute(client, interaction) {
    if (
      interaction.isStringSelectMenu() &&
      interaction.customId === 'payment_methods'
    ) {
      const selected = interaction.values;
      selectedPaymentMethods.set(
        `${interaction.message.id}_${interaction.user.id}`,
        selected,
      );
      await interaction.deferUpdate();
      return;
    }

    if (!interaction.isButton()) return;
    if (interaction.customId !== 'payment_methods:add') return;

    const emojis = (await client.db.get('emojis')) || {};
    const selected = selectedPaymentMethods.get(
      `${interaction.message.id}_${interaction.user.id}`,
    );

    if (!selected || selected.length === 0) {
      return await interaction.update({
        embeds: [
          errorEmbed(
            'Please select at least one payment method from the dropdown first.',
          ),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    const emojiString = selected
      .map((method) => emojis[method])
      .filter(Boolean)
      .join('/');

    await client.db.set(
      `user_${interaction.user.id}_payment_methods`,
      emojiString,
    );
    selectedPaymentMethods.delete(
      `${interaction.message.id}_${interaction.user.id}`,
    );

    await interaction.update({
      embeds: [
        successEmbed(
          'Your payment methods have been updated successfully!',
        ),
      ],
      components: [],
    });
  },
};
