import { App } from '@slack/bolt';
import { StringIndexed } from '@slack/bolt/dist/types/helpers';
import messages from '../../messages';
import { BlockfrostClient } from '../../services/blockfrost';
import { initializeBlockfrostClient } from '../../utils/blockfrost';
import { getAssetView } from './views/asset';
import { parseCommand } from '../../utils/command';

export const registerAssetCommand = (app: App<StringIndexed>) => {
  app.command('/asset', async ({ command, ack, say }) => {
    // Acknowledge command request
    await ack();
    const { args, options } = parseCommand(command);
    const assetHex = args[0];

    if (!assetHex) {
      await say('Missing asset hex.');
      return;
    }

    const bClient = await initializeBlockfrostClient(command, { network: options.network });
    if (!bClient) {
      await say(messages.CMD_LINK_PROJECT);
      return;
    }

    if (!command.text) {
      await say('Missing transaction hash.');
      return;
    }

    try {
      const asset = await bClient.getAsset(assetHex);
      await say(getAssetView(asset, options.json));
    } catch (error) {
      const response = BlockfrostClient.handleError(error, command.text);
      await say(response);
    }
  });

  app.action('btn_asset_explorer', async ({ ack }) => {
    // Acknowledge the action
    await ack();
  });
};
