import { logger } from '../utils/logger.js';

const loadConfig = () => {
  if (!process.env.DB_CONNECTION_STRING) {
    throw Error('Set env variable DB_CONNECTION_STRING');
  }

  logger.info(`DB SSL settings: ${process.env.DATABASE_SSL}\nCA cert*\n${process.env.CA_CERT}`);

  return {
    db: {
      connectionString: process.env.DB_CONNECTION_STRING,
      maxConnections: process.env.DB_MAX_CONNECTIONS ? Number(process.env.DB_MAX_CONNECTIONS) : 2,
      connectionTimeout: process.env.DB_CONNECTION_TIMEOUT
        ? Number(process.env.DB_CONNECTION_TIMEOUT)
        : 5000,
      idleTimeoutMs: process.env.DB_IDLE_TIMEOUT ? Number(process.env.DB_IDLE_TIMEOUT) : 10000,
      ssl:
        process.env.DATABASE_SSL !== 'false'
          ? process.env.CA_CERT
            ? {
                rejectUnauthorized: true,
                // base64-encoded CA cert stored in env var
                ca: Buffer.from(process.env.CA_CERT, 'base64').toString('utf-8'),
              }
            : {
                rejectUnauthorized: false,
              }
          : false,
    },
    sentry: {
      dsn: process.env.SENTRY_DSN,
    },
  };
};

export const mainConfig = loadConfig();
