import { PermissionsBitField } from 'discord.js';

export const isSeller = async (client, user) => {
  const setup = (await client.db.get(`guild_${user.guild.id}`)) || {};
  if (!setup || !setup.seller_roles) return false;

  if (
    user.roles.cache.some((role) =>
      setup.seller_roles.includes(role.id),
    )
  ) {
    return true;
  }

  return false;
};

export const isAdmin = (user) => {
  return user.permissions.has(
    PermissionsBitField.Flags.Administrator,
  );
};
