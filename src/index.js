import 'dotenv/config';
import Bot from './bot/client.js';
import { logger } from './utils/logger.js';

// validate required environment variables
function validateEnvironmentVariables() {
  const required = [
    { name: 'DISCORD_BOT_TOKEN', value: process.env.DISCORD_BOT_TOKEN },
    { name: 'CLIENT_ID', value: process.env.CLIENT_ID },
  ];

  const missing = required.filter(env => !env.value || env.value.trim() === '');

  if (missing.length > 0) {
    const missingNames = missing.map(env => env.name).join(', ');
    throw new Error(`Missing required environment variables: ${missingNames}`);
  }


  // validate CLIENT_ID format
  if (!/^\d+$/.test(process.env.CLIENT_ID)) {
    throw new Error('CLIENT_ID must be a valid Discord application ID (numeric)');
  }

  logger.info('Environment variables validated successfully');
}

(async () => {
  try {
    validateEnvironmentVariables();

    const bot = new Bot(
      process.env.DISCORD_BOT_TOKEN,
      process.env.CLIENT_ID,
      process.env.MONGO_DB_URL,
    );

    await bot.start();
    logger.info('Bot started successfully');
  } catch (error) {
    logger.error('Failed to start application:', error);
    process.exit(1);
  }
})();
