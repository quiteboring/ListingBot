import {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';

export const createModal = async (client, interaction, title, inputs) => {
  const { customId } = interaction;
  const modal = new ModalBuilder().setCustomId(customId).setTitle(title);

  const components = inputs.map((input) => {
    return new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId(input.customId)
        .setLabel(input.label)
        .setStyle(TextInputStyle.Short)
        .setRequired(true),
    );
  });

  modal.addComponents(components);

  await interaction.showModal(modal);
};

