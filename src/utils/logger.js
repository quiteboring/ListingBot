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
  // handle multiple arguments by formatting them as a single message????? idk how to explain this or wtf went wrong
  const formattedMessage = Array.isArray(message)
    ? message.map(arg =>
        typeof arg === 'object' && arg instanceof Error
          ? `${arg.message}\n${arg.stack || ''}`
          : String(arg)
      ).join(' ')
    : message;

  console.log(
    `${color}${colors.bold}[${getTimestamp()}] [${level.toUpperCase()}] - ${formattedMessage}${colors.reset}`,
  );
};

export const logger = {
  info: (...args) => log('info', args, colors.green),
  warn: (...args) => log('warn', args, colors.yellow),
  error: (...args) => log('error', args, colors.red),
  debug: (...args) => log('debug', args, colors.blue),
};
