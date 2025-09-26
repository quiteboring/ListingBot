import { errorEmbed, successEmbed } from './embed.js';
import {
  CategoryChannel,
  ChannelType,
  EmbedBuilder,
  MessageFlags,
  PermissionsBitField,
} from 'discord.js';
import config from '../config.js';

export const saveTicketsCategory = async (client, interaction) => {
  const category = interaction.options.getChannel('category');

  if (!(category instanceof CategoryChannel)) {
    await interaction.reply({
      embeds: [errorEmbed('Provided value is not a category.')],
      flags: MessageFlags.Ephemeral,
    });

    return;
  }

  await client.db.set('tickets_category', category.id);
  await interaction.reply({
    embeds: [
      successEmbed(
        `Successfully set ticket category ID to \`${category.id}\``,
      ),
    ],

    flags: MessageFlags.Ephemeral,
  });
};

export const createTicketChannel = async (
  client,
  interaction,
  title,
  embedFields,
) => {
  try {
    const ticketsCategoryId = await client.db.get('tickets_category');
    let index = await client.db.get('ticket_count');
    if (!index) index = 1;

    const channel = await interaction.guild.channels.create({
      name: `ticket-${index}`,
      type: ChannelType.GuildText,
      parent: ticketsCategoryId,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: interaction.user.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory,
          ],
        },
      ],
    });

    await client.db.set('ticket_count', index + 1);
    interaction.reply({
      embeds: [successEmbed('Made ticket!')],
      flags: MessageFlags.Ephemeral,
    });

    const embed = new EmbedBuilder()
      .setTitle(title)
      .addFields(embedFields)
      .setFooter({
        text: `${interaction.user.displayName} (${interaction.user.id})`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      })
      .setTimestamp(Date.now())
      .setColor(config.mainColor);

    await channel.send({
      content: `<@${interaction.user.id}>`,
      embeds: [embed],
    });
  } catch (err) {
    interaction.reply({
      embeds: [errorEmbed('Unable to make ticket.')],
      flags: MessageFlags.Ephemeral,
    });
  }
};
