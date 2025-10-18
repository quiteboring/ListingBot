import { MessageFlags } from 'discord.js';
import { successEmbed } from '../../utils/embeds.js';

export default {
  name: 'interactionCreate',

  /**
   * @param {import("../bot/client").default} client
   * @param {import("discord.js").Interaction} interaction
   */
  async execute(client, interaction) {
    if (!interaction.customId || !interaction.customId.startsWith('tos:'))
      return;

    const type = interaction.customId.split(':')[1];

    switch (type) {
      case 'edit':
        const tos = interaction.fields.getTextInputValue('tos');
        const guildData =
          (await client.db.get(`guild_${interaction.guild.id}`)) || {};

        guildData.tos.message = tos;
        guildData.tos.users = [];

        await client.db.set(`guild_${interaction.guild.id}`, guildData);

        await interaction.reply({
          embeds: [
            successEmbed('Terms of Service updated successfully.'),
          ],
          flags: MessageFlags.Ephemeral,
        });
        break;
      case 'accept':
        const guild =
          (await client.db.get(`guild_${interaction.guild.id}`)) || {};

        if (!guild.tos) {
          await interaction.reply({
            embeds: [
              errorEmbed(
                'There are no Terms of Service set for this server.',
              ),
            ],
            flags: MessageFlags.Ephemeral,
          });
          return;
        }

        if (!guild.tos.users) {
          guild.tos.users = [];
        }

        if (guild.tos.users.includes(interaction.user.id)) {
          await interaction.reply({
            embeds: [
              errorEmbed(
                'You have already accepted the Terms of Service.',
              ),
            ],
            flags: MessageFlags.Ephemeral,
          });
          return;
        }

        guild.tos.users.push(interaction.user.id);
        await client.db.set(`guild_${interaction.guild.id}`, guild);

        await interaction.reply({
          embeds: [
            successEmbed('You have accepted the Terms of Service.'),
          ],
          flags: MessageFlags.Ephemeral,
        });
    }
  },
};
