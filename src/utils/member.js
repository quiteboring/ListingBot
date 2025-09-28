import { PermissionsBitField } from 'discord.js';

export const hasAdmin = async (interaction) => {
  return interaction.member.permissions.has(
    PermissionsBitField.Flags.Administrator,
  );
};
