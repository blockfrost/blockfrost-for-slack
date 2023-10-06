import { SlashCommand, SlackAction } from '@slack/bolt';
import { dbStore } from '../services/db';
import { getInstallationId } from './slack';
import { BlockfrostClient } from '../services/blockfrost';
import { CardanoNetwork } from '@blockfrost/blockfrost-js/lib/types';

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
