const loadConfig = () => {
  if (!process.env.DB_CONNECTION_STRING) {
    throw Error('Set env variable DB_CONNECTION_STRING');
  }

  return {
    db: {
      connectionString: process.env.DB_CONNECTION_STRING,
      maxConnections: Number(process.env.DB_MAX_CONNECTIONS) ?? 2,
      connectionTimeout: Number(process.env.DB_CONNECTION_TIMEOUT) ?? 5000,
      idleTimeoutMs: Number(process.env.DB_IDLE_TIMEOUT) ?? 10000,
      ssl:
        process.env.DB_SSL !== undefined
          ? JSON.parse(process.env.DB_SSL)
          : {
              rejectUnauthorized: false,
            },
    },
  };
};

export const mainConfig = loadConfig();
