const loadConfig = () => {
  if (!process.env.DB_CONNECTION_STRING) {
    throw Error('Set env variable DB_CONNECTION_STRING');
  }

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
                ca: process.env.CA_CERT,
              }
            : {
                rejectUnauthorized: false,
              }
          : false,
    },
  };
};

export const mainConfig = loadConfig();
