const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

const getTimestamp = () => {
  const now = new Date();
  return now.toLocaleTimeString();
};

const log = (level, message, color) => {
  console.log(
    `[${getTimestamp()}] ${color}[${level.toUpperCase()}]${colors.reset} - ${message}`,
  );
};

export const logger = {
  info: (message) => log('info', message, colors.green),
  warn: (message) => log('warn', message, colors.yellow),
  error: (message) => log('error', message, colors.red),
  debug: (message) => log('debug', message, colors.blue),
};
