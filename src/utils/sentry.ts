import * as Sentry from '@sentry/node';
import { CaptureConsole } from '@sentry/integrations';
import { mainConfig } from '../config/config.js';
import { logger } from './logger.js';

type Primitive = number | string | boolean | bigint | symbol | null | undefined;
export const setSentryTag = (key: string, value: Primitive) => {
  Sentry.configureScope(scope => {
    scope.setTag(key, value);
  });
};

export const initializeSentry = () => {
  if (!mainConfig.sentry) {
    logger.warn(`Config variable "sentry" not set. Errors will not be sent to Sentry!`);
  } else {
    Sentry.init({
      dsn: mainConfig.sentry.dsn,
      release: process.env.BUILD_COMMIT,
      environment: process.env.NODE_ENV ?? 'unknown',
      integrations: [
        new CaptureConsole({
          levels: ['error'],
        }),
      ],
      tracesSampleRate: 1,
    });
  }
};
