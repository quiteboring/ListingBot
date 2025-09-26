const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  red: '\x1b[38;5;52m',
  green: '\x1b[38;5;22m',
  yellow: '\x1b[38;5;58m',
  blue: '\x1b[38;5;18m',
};

const getTimestamp = () => {
  const now = new Date();
  return now.toLocaleTimeString();
};

const log = (level, message, color) => {
  console.log(
    `${color}${colors.bold}[${getTimestamp()}] [${level.toUpperCase()}] - ${message}${colors.reset}`,
  );
};

export const logger = {
  info: (message) => log('info', message, colors.green),
  warn: (message) => log('warn', message, colors.yellow),
  error: (message) => log('error', message, colors.red),
  debug: (message) => log('debug', message, colors.blue),
};
