import { EmbedBuilder } from '@discordjs/builders';

export const editCoinPanel = async (interaction) => {
  const msg = interaction.message;
  const embed = msg.embeds[0];
  const stock = interaction.fields.getTextInputValue('current_stock');

  const newEmbed = new EmbedBuilder()
    .setTitle(embed.title)
    .setDescription(
      `To open a ticket, press a button below.\n\n**Current Stock:** ${stock}`,
    )
    .setFields(embed.fields)
    .setFooter(embed.footer)
    .setColor(embed.color);

  await interaction.deferUpdate();
  await msg.edit({
    embeds: [newEmbed],
  });
};
