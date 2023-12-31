import { SlashCommand, SlackAction } from '@slack/bolt';
import { dbStore } from '../services/db/index.js';
import { getInstallationId } from './slack.js';
import { BlockfrostClient } from '../services/blockfrost/index.js';
import { CardanoNetwork } from '@blockfrost/blockfrost-js/lib/types/index.js';

export const getNetworkFromProjectId = (projectId: string) => {
  // Define network prefixes
  const networks = ['mainnet', 'preview', 'preprod'];

  for (const network of networks) {
    if (projectId.startsWith(network)) {
      return network;
    }
  }

  // Return 'unknown' if no network prefix is found
  return null;
};

export const initializeBlockfrostClient = async (
  commandOrAction: SlashCommand | SlackAction,
  options?: { network?: CardanoNetwork },
) => {
  const installationId = getInstallationId(commandOrAction);

  const projectId = await dbStore.getProjectId(installationId, options?.network);

  if (!projectId) {
    return null;
  }

  const bClient = new BlockfrostClient(projectId);

  return bClient;
};
