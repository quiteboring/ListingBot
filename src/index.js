import 'dotenv/config';
import Bot from './bot/client.js';

(async () => {
  await new Bot(
    process.env.DISCORD_BOT_TOKEN,
    process.env.CLIENT_ID,
    process.env.HYPIXEL_API_KEY,
    process.env.OWNER_ID,
  ).start();
})();
