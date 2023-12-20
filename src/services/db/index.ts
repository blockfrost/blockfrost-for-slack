/* eslint-disable @typescript-eslint/ban-types */
import { Installation } from '@slack/bolt';
import pgLib from 'pg-promise';
// eslint-disable-next-line import/extensions
import pg from 'pg-promise/typescript/pg-subset.js';
import { mainConfig } from '../../config/config.js';
import { getNetworkFromProjectId } from '../../utils/blockfrost.js';
import { CardanoNetwork } from '@blockfrost/blockfrost-js/lib/types/index.js';

const pgp = pgLib({});

export const db = pgp({
  connectionString: mainConfig.db.connectionString,
  // maximum number of clients the pool should contain
  // by default this is set to 10.
  max: mainConfig.db.maxConnections,
  // number of milliseconds to wait before timing out when connecting a new client
  // by default this is 0 which means no timeout
  connectionTimeoutMillis: mainConfig.db.connectionTimeout,
  // number of milliseconds a client must sit idle in the pool and not be checked out
  // before it is disconnected from the backend and discarded
  // default is 10000 (10 seconds) - set to 0 to disable auto-disconnection of idle clients
  idleTimeoutMillis: mainConfig.db.idleTimeoutMs,
  ssl: mainConfig.db.ssl,
});

class DBStore {
  client: pgLib.IDatabase<{}, pg.IClient>;

  constructor(db: pgLib.IDatabase<{}, pg.IClient>) {
    this.client = db;
  }

  storeInstallation = async (installationId: string, installation: Installation<'v1' | 'v2'>) => {
    // TODO: Upsert if installation_id already exist
    await this.client.none(
      `INSERT INTO slack_installations(installation_id, installation_data) VALUES($1, $2:json)`,
      [installationId, installation],
    );
  };

  fetchInstallation = async (installationId: string) => {
    const installation = await this.client.oneOrNone<{
      installation_data: Installation<'v1' | 'v2'>;
    }>(`SELECT installation_data FROM slack_installations WHERE installation_id = $1`, [
      installationId,
    ]);

    return installation?.installation_data;
  };

  deleteInstallation = async (installationId: string) => {
    await this.client.tx(async t => {
      await t.none(`DELETE FROM slack_linked_projects WHERE installation_id = $1`, [
        installationId,
      ]);
      await t.none(`DELETE FROM slack_linked_webhooks WHERE installation_id = $1`, [
        installationId,
      ]);
      await t.none(`DELETE FROM slack_installations WHERE installation_id = $1`, [installationId]);
    });
  };

  registerProjectId = async (installationId: string, projectId: string) => {
    const network = getNetworkFromProjectId(projectId);

    if (!network) {
      throw Error('Invalid project_id');
    }

    // UPSERT
    await this.client.none(
      `INSERT INTO slack_linked_projects (installation_id, network, project_id)
            VALUES ($1, $2, $3)
            ON CONFLICT (installation_id, network)
            DO UPDATE SET project_id = EXCLUDED.project_id;`,
      [installationId, network, projectId],
    );
  };

  getProjectId = async (installationId: string, network: CardanoNetwork = 'mainnet') => {
    const res = await this.client.oneOrNone<{ project_id: string }>(
      `SELECT project_id FROM slack_linked_projects WHERE installation_id = $1 AND network = $2`,
      [installationId, network],
    );

    return res?.project_id;
  };

  getWebhook = async (installationId: string, webhookId: string) => {
    const webhook = await this.client.oneOrNone<{
      installation_id: string;
      webhook_id: string;
      webhook_auth_token: string;
      slack_channel: string;
    }>(
      `SELECT installation_id, webhook_id, webhook_auth_token, slack_channel 
      FROM slack_linked_webhooks 
      WHERE installation_id = $1 AND webhook_id = $2`,
      [installationId, webhookId],
    );

    return webhook;
  };

  linkWebhook = async (
    installationId: string,
    webhookId: string,
    authToken: string,
    channelId: string,
  ) => {
    // UPSERT
    await this.client.none(
      `INSERT INTO slack_linked_webhooks (installation_id, webhook_id, webhook_auth_token, slack_channel)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (installation_id, webhook_id)
            DO UPDATE SET webhook_auth_token = EXCLUDED.webhook_auth_token, slack_channel = EXCLUDED.slack_channel;`,
      [installationId, webhookId, authToken, channelId],
    );
  };

  unlinkWebhook = async (installationId: string, webhookId: string) => {
    await this.client.none(
      `DELETE FROM slack_linked_webhooks
      WHERE installation_id = $1 AND webhook_id = $2`,
      [installationId, webhookId],
    );
  };
}

export const dbStore = new DBStore(db);
