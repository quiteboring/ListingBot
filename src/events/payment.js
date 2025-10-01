import { successEmbed } from '../utils/embed.js';

export default {
  name: 'interactionCreate',

  /**
   * @param {import("../bot/client").default} client
   * @param {import("discord.js").Interaction} interaction
   */
  async execute(client, interaction) {
    if (!interaction.isStringSelectMenu()) return;

    if (interaction.customId === 'payment_method_select') {
      const selectedMethods = interaction.values;
      const emojis = (await client.db.get('emojis')) || {};

      const emojiString = selectedMethods
        .map((method) => emojis[method])
        .filter(Boolean)
        .join('/');

      await client.db.set(
        `payment_methods_${interaction.user.id}`,
        emojiString,
      );

      await interaction.update({
        embeds: [
          successEmbed('Your payment methods have been updated!'),
        ],
        components: [],
      });
    }
  },
};
