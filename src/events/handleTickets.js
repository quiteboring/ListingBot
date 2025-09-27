import { MessageFlags } from 'discord.js';
import { closeTicket, reopenTicket } from '../utils/ticket.js';
import { errorEmbed, successEmbed } from '../utils/embed.js';
import { hasAdmin, hasSellerRole } from '../utils/member.js';
import { createTranscript } from 'discord-html-transcripts';

export default {
  name: 'interactionCreate',

  /**
   * @param {import("../bot/client").default} client
   * @param {import("discord.js").Interaction} interaction
   */
  async execute(client, interaction) {
    if (!interaction.isButton()) return;
    const channelStatus = await client.db.get(
      `${interaction.channel.id}-status`,
    );

    switch (interaction.customId) {
      case 'claim_ticket':
        if (
          !hasSellerRole(client, interaction) &&
          !hasAdmin(interaction)
        ) {
          await interaction.reply({
            embeds: [
              errorEmbed(
                'You are not a seller to claim this ticket.',
              ),
            ],
            flags: MessageFlags.Ephemeral,
          });

          break;
        }

        if (channelStatus && channelStatus.startsWith('claimed')) {
          await interaction.reply({
            embeds: [errorEmbed('This ticket has been claimed.')],
            flags: MessageFlags.Ephemeral,
          });

          break;
        }

        await interaction.deferUpdate();
        await client.db.set(
          `${interaction.channel.id}-status`,
          `claimed-${interaction.user.id}`,
        );
        await interaction.channel.send({
          embeds: [
            successEmbed(
              `Ticket claimed by <@${interaction.user.id}>`,
            ),
          ],
        });
        break;
      case 'unclaim_ticket':
        if (
          !hasSellerRole(client, interaction) &&
          !hasAdmin(interaction)
        ) {
          await interaction.reply({
            embeds: [
              errorEmbed(
                'You are not a seller to unclaim this ticket.',
              ),
            ],
            flags: MessageFlags.Ephemeral,
          });

          break;
        }

        if (
          channelStatus &&
          (!channelStatus.startsWith('claimed') ||
            (interaction.user.id != channelStatus.split('-')[1] &&
              !hasAdmin(interaction)))
        ) {
          await interaction.reply({
            embeds: [errorEmbed('You have not claimed this ticket.')],
            flags: MessageFlags.Ephemeral,
          });

          break;
        }

        await interaction.deferUpdate();
        await client.db.set(
          `${interaction.channel.id}-status`,
          `open`,
        );
        await interaction.channel.send({
          embeds: [
            errorEmbed(
              `Ticket unclaimed by <@${interaction.user.id}>`,
            ),
          ],
        });
        break;
      case 'close_ticket':
        if (channelStatus && channelStatus.startsWith('closed')) {
          await interaction.reply({
            embeds: [errorEmbed('This ticket is already closed.')],
            flags: MessageFlags.Ephemeral,
          });

          break;
        }

        if (
          !hasSellerRole(client, interaction) &&
          !hasAdmin(interaction)
        ) {
          await interaction.reply({
            embeds: [
              errorEmbed(
                'You do not have permission to close the ticket.',
              ),
            ],
            flags: MessageFlags.Ephemeral,
          });

          break;
        }

        await closeTicket(client, interaction);
        break;
      case 'reopen_ticket':
        if (!channelStatus || !channelStatus.startsWith('closed')) {
          await interaction.reply({
            embeds: [errorEmbed("This ticket isn't closed.")],
            flags: MessageFlags.Ephemeral,
          });

          break;
        }

        if (
          !hasSellerRole(client, interaction) &&
          !hasAdmin(interaction)
        ) {
          await interaction.reply({
            embeds: [
              errorEmbed(
                'You do not have permission to reopen the ticket.',
              ),
            ],
            flags: MessageFlags.Ephemeral,
          });

          break;
        }

        await reopenTicket(client, interaction);
        break;
      case 'delete_ticket':
        await interaction.reply({
          embeds: [errorEmbed('Deleting channel in 3 seconds.')],
          flags: MessageFlags.Ephemeral,
        });

        setTimeout(async () => {
          await client.db.delete(`${interaction.channel.id}-creator`);
          await client.db.delete(`${interaction.channel.id}-status`);
          await interaction.channel.delete();
        }, 3000);
        break;
      case 'gen_transcript':
        if (
          !hasSellerRole(client, interaction) &&
          !hasAdmin(interaction)
        ) {
          await interaction.reply({
            embeds: [
              errorEmbed(
                'You do not have permissions to generate a transcript.',
              ),
            ],
            flags: MessageFlags.Ephemeral,
          });

          break;
        }

        await interaction.deferUpdate();

        const transcript = await createTranscript(
          interaction.channel,
          { limit: -1 },
        );

        await interaction.channel.send({
          embeds: [successEmbed('Generated a transcript!')]
        });
        
        await interaction.channel.send({
          files: [transcript]
        })

        break;
    }
  },
};
