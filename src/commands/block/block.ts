import { App } from '@slack/bolt';
import { StringIndexed } from '@slack/bolt/dist/types/helpers.js';
import messages from '../../messages.js';
import { BlockfrostClient } from '../../services/blockfrost/index.js';
import { initializeBlockfrostClient } from '../../utils/blockfrost.js';
import { getBlockView } from './views/block.js';
import { parseCommand } from '../../utils/command.js';

export const registerBlockCommand = (app: App<StringIndexed>) => {
  app.command('/block', async ({ command, ack, say }) => {
    // Acknowledge command request
    await ack();
    const { args, options } = parseCommand(command);
    const hashOrNumber = args[0]?.trim();

    const bClient = await initializeBlockfrostClient(command, { network: options.network });

    if (!bClient) {
      await say(messages.CMD_LINK_PROJECT);
      return;
    }

    try {
      const block = await bClient.getBlock(hashOrNumber);

      await say(getBlockView(block, options.json));
    } catch (error) {
      const response = BlockfrostClient.handleError(error, command.text);

      await say(response);
    }
  });

  app.action('btn_block_explorer', async ({ ack }) => {
    // Acknowledge the action
    await ack();
  });
};
