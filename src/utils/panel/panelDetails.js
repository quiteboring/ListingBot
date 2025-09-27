import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  Message,
  MessageFlags,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';

/**
 * @param {import("../bot/client").default} client
 * @param {import("discord.js").Interaction} interaction
 */
export const sendDetailsModal = async (client, interaction) => {
  const modal = new ModalBuilder()
    .setCustomId('set_panel_details')
    .setTitle('Embed Title Setup');

  const nameInput = new TextInputBuilder()
    .setCustomId('panel_title')
    .setLabel('Enter the Embed Title')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const descriptionInput = new TextInputBuilder()
    .setCustomId('panel_description')
    .setLabel('Enter the Embed Description')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true);

  const nameRow = new ActionRowBuilder().addComponents(nameInput);
  const descriptionRow = new ActionRowBuilder().addComponents(
    descriptionInput,
  );

  modal.addComponents(nameRow, descriptionRow);
  await interaction.showModal(modal);
};

/**
 * @param {import("../bot/client").default} client
 * @param {import("discord.js").Interaction} interaction
 */
export const handleDetailsSubmission = async (
  client,
  interaction,
) => {
  await interaction.deferUpdate();

  const panelTitle =
    interaction.fields.getTextInputValue('panel_title');
  const panelDescription = interaction.fields.getTextInputValue(
    'panel_description',
  );

  // validate input lengths
  if (panelTitle.length > 256) {
    await interaction.followUp({
      content: 'Panel title must be 256 characters or less.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (panelDescription.length > 4096) {
    await interaction.followUp({
      content: 'Panel description must be 4096 characters or less.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const msg = interaction.message;

  const firstEmbed = EmbedBuilder.from(msg.embeds[0])
    .setTitle('Step 2/3 Set the panel buttons')
    .setDescription(
      "This will be customizing a panel's buttons.\n\nClick the buttons below to add or remove last button.\n\n_The panel will be created in this channel._",
    );

  const secondEmbed = EmbedBuilder.from(msg.embeds[1])
    .setTitle(panelTitle)
    .setDescription(panelDescription);

  await msg.edit({
    embeds: [firstEmbed, secondEmbed],
    components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('add_panel_button')
          .setStyle(ButtonStyle.Success)
          .setLabel('Add Button'),
        new ButtonBuilder()
          .setCustomId('remove_panel_button')
          .setStyle(ButtonStyle.Danger)
          .setLabel('Remove Button'),
        new ButtonBuilder()
          .setCustomId('next_step')
          .setStyle(ButtonStyle.Secondary)
          .setLabel('Next Step'),
      ),
    ],
  });
};
