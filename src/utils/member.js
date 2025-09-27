export const hasSellerRole = async (client, interaction) => {
  const sellerRoleId = await client.db.get('seller_role');

  if (!sellerRoleId) {
    return false;
  }

  return interaction.member.roles.cache.has(sellerRoleId);
};

export const hasAdmin = async (interaction) => {
  return interaction.member.permissions.has(
    PermissionsBitField.Flags.Administrator,
  );
};
