import { Installation, InstallationQuery, InstallationStore } from '@slack/bolt';
import { Logger } from '../utils/logger';
import { dbStore } from '../services/db';

export default class BlockfrostInstallationStore implements InstallationStore {
  public async storeInstallation(installation: Installation, logger?: Logger): Promise<void> {
    if (installation.isEnterpriseInstall && installation.enterprise !== undefined) {
      // handle storing org-wide app installation
      logger?.debug('storing org installation');
      return await dbStore.storeInstallation(installation.enterprise.id, installation);
    }
    if (installation.team !== undefined) {
      // single team app installation
      logger?.debug('storing single team installation');

      return await dbStore.storeInstallation(installation.team.id, installation);
    } else {
      throw new Error('Failed saving installation data to installationStore');
    }
  }

  public async fetchInstallation(
    installQuery: InstallationQuery<boolean>,
    logger?: Logger,
  ): Promise<Installation<'v1' | 'v2'>> {
    logger?.warn('Retrieving Access Token from DB.');

    if (installQuery.isEnterpriseInstall && installQuery.enterpriseId !== undefined) {
      logger?.debug('fetching org installation');
      const installation = await dbStore.fetchInstallation(installQuery.enterpriseId);
      if (!installation) {
        throw new Error('Failed fetching installation');
      }
      return installation;
    }
    if (installQuery.teamId !== undefined) {
      logger?.debug('fetching single team installation');
      const installation = await dbStore.fetchInstallation(installQuery.teamId);
      if (!installation) {
        throw new Error('Failed fetching installation');
      }
      return installation;
    }
    throw new Error('Failed fetching installation');
  }

  public async deleteInstallation(
    installQuery: InstallationQuery<boolean>,
    logger?: Logger,
  ): Promise<void> {
    if (logger !== undefined) {
      logger.warn('Deleting Access Token from DB.');
    }

    if (installQuery.isEnterpriseInstall && installQuery.enterpriseId !== undefined) {
      logger?.debug('deleting org installation');
      return await dbStore.deleteInstallation(installQuery.enterpriseId);
    }
    if (installQuery.teamId !== undefined) {
      logger?.debug('deleting single team installation');
      return await dbStore.deleteInstallation(installQuery.teamId);
    } else {
      throw new Error('Failed to delete installation');
    }
  }
}
