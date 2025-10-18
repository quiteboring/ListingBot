export default {
  name: 'messageCreate',

  /**
   * @param {import("../bot/client").default} client
   * @param {import("discord.js").Message} message
   */
  async execute(client, message) {
    if (!message.inGuild()) return;

    const guild =
      (await client.db.get(`guild_${message.guild.id}`)) || {};
    const vouches = guild?.vouches || [];
    const vouchChannel = guild.vouch_channel || '';

    if (message.channel.id != vouchChannel) return;
    if (!message.content.startsWith('+rep')) return;
    if (message.author.bot) return;

    const mentions = message.mentions.users;

    if (mentions.size === 0) return;

    vouches.push({
      user: mentions.first().id,
      vouchedBy: message.author.id,
      message: message.content,
      date: Date.now(),
    });

    await message.react('✅');
    await client.db.set(`guild_${message.guild.id}`, {
      ...guild,
      vouches,
    });
  },
};
