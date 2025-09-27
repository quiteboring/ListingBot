import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';

const MAX_BUTTONS = 5;

const updatePreviewButtons = async (interaction, buttons) => {
  const originalMessage = interaction.message;
  const [firstEmbed, secondEmbed] = originalMessage.embeds;

  const buttonComponents = buttons.map((btn) => {
    const button = new ButtonBuilder()
      .setCustomId(btn.customId)
      .setLabel(btn.label)
      .setStyle(btn.style);

    if (btn.emoji) button.setEmoji(btn.emoji);

    return button;
  });

  const controlRow = ActionRowBuilder.from(
    originalMessage.components[0],
  );
  const previewRow = new ActionRowBuilder().addComponents(
    buttonComponents,
  );

  const components = [controlRow];

  if (buttons.length > 0) {
    components.push(previewRow);
  }

  await originalMessage.edit({
    embeds: [firstEmbed, secondEmbed],
    components,
  });
};

export const sendAddButtonModal = async (client, interaction) => {
  const dbKey = `panel_buttons_${interaction.message.id}`;
  const buttons = (await client.db.get(dbKey)) || [];

  if (buttons.length >= MAX_BUTTONS) {
    return interaction.reply({
      content: `You can only add a maximum of ${MAX_BUTTONS} buttons.`,
      ephemeral: true,
    });
  }

  const modal = new ModalBuilder()
    .setCustomId(`add_panel_button_modal_${interaction.message.id}`)
    .setTitle('Add a New Button');

  const labelInput = new TextInputBuilder()
    .setCustomId('button_label')
    .setLabel('Button Label')
    .setPlaceholder('e.g., General Support')
    .setStyle(TextInputStyle.Short)
    .setMaxLength(80)
    .setRequired(true);

  const emojiInput = new TextInputBuilder()
    .setCustomId('button_emoji')
    .setLabel('Button Emoji (Optional)')
    .setPlaceholder('e.g., 👋')
    .setStyle(TextInputStyle.Short)
    .setRequired(false);

  modal.addComponents(
    new ActionRowBuilder().addComponents(labelInput),
    new ActionRowBuilder().addComponents(emojiInput),
  );

  await interaction.showModal(modal);
};

export const handleAddButtonSubmission = async (
  client,
  interaction,
) => {
  await interaction.deferUpdate();

  const label = interaction.fields.getTextInputValue('button_label');
  const emoji =
    interaction.fields.getTextInputValue('button_emoji') || null;

  const newButton = {
    customId: `panel_ticket_${Date.now()}`,
    label,
    style: ButtonStyle.Secondary,
    emoji,
  };

  const dbKey = `panel_buttons_${interaction.message.id}`;
  const buttons = (await client.db.get(dbKey)) || [];

  if (buttons.length < MAX_BUTTONS) {
    buttons.push(newButton);
    await client.db.set(dbKey, buttons);
  }

  await updatePreviewButtons(interaction, buttons);
};

export const handleRemoveButton = async (client, interaction) => {
  await interaction.deferUpdate();

  const dbKey = `panel_buttons_${interaction.message.id}`;
  const buttons = (await client.db.get(dbKey)) || [];

  if (buttons.length === 0) {
    interaction.followUp({
      content: 'There are no buttons to remove.',
      ephemeral: true,
    });
    return;
  }

  buttons.pop();

  await client.db.set(dbKey, buttons);
  await updatePreviewButtons(interaction, buttons);
};
