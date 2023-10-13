import config from 'config';
import { readFileSync } from 'fs';
import { logger } from '../utils/logger.js';

const loadConfig = () => {
  // connectionString is read from db.connectionString if it exists, otherwise load from file
  // defined in db.connectionStringFile
  let pgConnectionString = '';

  if (config.has('db.connectionString')) {
    pgConnectionString = config.get('db.connectionString');
  } else {
    const filename: string = config.get('db.connectionStringFile');

    logger.info(`Reading pgConnectionString from ${filename} `);
    pgConnectionString = readFileSync(filename, 'utf8');
  }

  const pgMaxConnections: number = config.has('db.maxConnections')
    ? config.get('db.maxConnections')
    : 2;
  const pgConnectionTimeoutMs: number = config.has('db.connectionTimeoutMs')
    ? config.get('db.connectionTimeoutMs')
    : 5000;
  const pgIdleTimeoutMs: number = config.has('db.idleTimeoutMs')
    ? config.get('db.idleTimeoutMs')
    : 10000;

  const pgSsl: boolean | Record<string, unknown> = config.has('db.ssl')
    ? config.get('db.ssl')
    : {
        rejectUnauthorized: false,
      };

  return {
    db: {
      connectionString: pgConnectionString,
      maxConnections: pgMaxConnections,
      connectionTimeout: pgConnectionTimeoutMs,
      idleTimeoutMs: pgIdleTimeoutMs,
      ssl: pgSsl,
    },
  };
};

export const mainConfig = loadConfig();
