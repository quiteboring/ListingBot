import { PermissionsBitField } from 'discord.js';

export const hasAdmin = async (interaction) => {
  return interaction.member.permissions.has(
    PermissionsBitField.Flags.Administrator,
  );
};

export const isSeller = async (client, interaction) => {
  const setup = await client.db.get(`setup_${interaction.guild.id}`);
  if (!setup || !setup.sellerRoles || !setup.sellerRoles.length)
    return false;

  const member = await interaction.guild.members.fetch(
    interaction.user.id,
  );
  return member.roles.cache.some((role) =>
    setup.sellerRoles.includes(role.id),
  );
};
