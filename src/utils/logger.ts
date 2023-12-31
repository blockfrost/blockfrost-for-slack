import { Logger, LogLevel, ConsoleLogger } from '@slack/logger';
export type { Logger, LogLevel } from '@slack/logger';

let instanceCount = 0;

export function getLogger(name: string, level: LogLevel, existingLogger?: Logger): Logger {
  // Get a unique ID for the logger.
  const instanceId = instanceCount;

  instanceCount += 1;

  // Set up the logger.
  const logger: Logger = (() => {
    if (existingLogger !== undefined) {
      return existingLogger;
    }
    return new ConsoleLogger();
  })();

  logger.setName(`${name}:${instanceId}`);
  if (level !== undefined) {
    logger.setLevel(level);
  }

  return logger;
}

export const logger = getLogger('default', process.env.DEBUG ? LogLevel.DEBUG : LogLevel.INFO);
