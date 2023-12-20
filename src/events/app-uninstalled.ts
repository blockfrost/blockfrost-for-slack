import { App } from '@slack/bolt';
import BlockfrostInstallationStore from '../installation-store/index.js';
import { logger } from '../utils/logger.js';
import { StringIndexed } from '@slack/bolt/dist/types/helpers.js';

export const registerAppUninstalledEvent = (app: App<StringIndexed>) => {
  app.event('app_uninstalled', async ({ context }) => {
    try {
      const store = new BlockfrostInstallationStore({ logger: logger });

      await store.deleteInstallation({
        teamId: context.teamId,
        enterpriseId: context.enterpriseId,
        isEnterpriseInstall: context.isEnterpriseInstall,
      });
    } catch (error) {
      logger.error(error);
    }
  });
};
