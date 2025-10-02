export const getMember = (profile, uuid) => {
  const member = profile.members[uuid];

  if (!member) {
    throw new Error(`Member with UUID ${uuid} not found in profile.`);
  }

  return member;
};
