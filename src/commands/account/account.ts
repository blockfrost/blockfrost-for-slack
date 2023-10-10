import { App } from '@slack/bolt';
import { StringIndexed } from '@slack/bolt/dist/types/helpers';
import messages from '../../messages';
import { BlockfrostClient } from '../../services/blockfrost';
import { initializeBlockfrostClient } from '../../utils/blockfrost';
import { parseCommand } from '../../utils/command';
import { getAccountView } from './views/account';
import { getPoolView } from '../pool/views/pool';

export const registerAccountCommand = (app: App<StringIndexed>) => {
  app.command('/account', async ({ command, ack, say }) => {
    // Acknowledge command request
    await ack();
    const { args, options } = parseCommand(command);
    const address = args[0]?.trim();

    const bClient = await initializeBlockfrostClient(command, { network: options.network });
    if (!bClient) {
      await say(messages.CMD_LINK_PROJECT);
      return;
    }

    try {
      const accountData = await bClient.getAccount(address);
      await say(getAccountView(accountData, options.network, options.json));
    } catch (error) {
      const response = BlockfrostClient.handleError(error, command.text);
      await say(response);
    }
  });

  app.action('btn_account_explorer', async ({ ack }) => {
    // Acknowledge the action
    await ack();
  });

  app.action('btn_account_pool', async ({ ack, action, body, say }) => {
    // Acknowledge the action
    await ack();

    if (!('value' in action)) {
      // action.value with the tx hash must be present
      return;
    }

    const { pool, network, jsonMode } = JSON.parse(action.value);

    const bClient = await initializeBlockfrostClient(body, { network });
    if (!bClient) {
      await say(messages.CMD_LINK_PROJECT);
      return;
    }
    const poolData = await bClient.getPool(pool);

    await say(getPoolView(poolData, network, jsonMode));
    try {
    } catch (error) {
      const response = BlockfrostClient.handleError(error, 'a');
      await say(response);
    }
  });
};
