import { SlashCommandBuilder, MessageFlags, EmbedBuilder } from 'discord.js';
import { isSeller } from '../utils/checks.js';
import { errorEmbed, successEmbed } from '../utils/embeds.js';
import { createTranscript } from 'discord-html-transcripts';
import colors from '../utils/colors.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Command for adjusting a ticket.')
    .addSubcommand((sub) =>
      sub
        .setName('delete')
        .setDescription('Deletes a ticket & DMs a transcript.'),
    ),

  /**
   * @param {import('../bot/client.js').default} client
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(client, interaction) {
    if (!(await isSeller(client, interaction.member))) {
      return await interaction.reply({
        embeds: [
          errorEmbed('Insufficient permissions to use this command.'),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    const sub = interaction.options.getSubcommand();
    const guildData =
      (await client.db.get(`guild_${interaction.guild.id}`)) || {};

    switch (sub) {
      case 'delete': {
        let tickets = guildData.tickets || [];

        const ticket = tickets.find(
          (t) => t.channelId === interaction.channel.id,
        );

        if (!ticket) {
          return await interaction.reply({
            embeds: [errorEmbed('This channel is not a ticket.')],
            flags: MessageFlags.Ephemeral,
          });
        }

        try {
          const transcript = await createTranscript(interaction.channel, {
            limit: -1,
          });

          const embed = new EmbedBuilder()
            .setTitle('📋 Ticket Transcript')
            .setDescription(
              `Here is the transcript for the ticket <#${interaction.channel.id}>.`,
            )
            .setColor(colors.mainColor)
            .setTimestamp();

          await interaction.user.send({
            embeds: [embed],
            files: [transcript],
          })

          ticket.users.forEach(async id => {
            if (interaction.user.id != id) {
              const user = await interaction.guild.members.fetch(id);

              await user.send({
                embeds: [embed],
                files: [transcript],
              });
            }
          });
        } catch {}

        tickets = tickets.filter((t) => t.channelId !== ticket.channelId);

        await client.db.set(`guild_${interaction.guild.id}`, {
          ...guildData,
          tickets,
        });

        await interaction.reply({
          embeds: [
            successEmbed('This ticket will be deleted in 3 seconds.'),
          ],
          flags: MessageFlags.Ephemeral,
        });
      
        setTimeout(async () => {
          await interaction.channel.delete().catch(() => {});
        }, 3000);

        break;
      }
    }
  },
};
