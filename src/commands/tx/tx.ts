import { App } from '@slack/bolt';
import { StringIndexed } from '@slack/bolt/dist/types/helpers.js';
import messages from '../../messages.js';
import { BlockfrostClient } from '../../services/blockfrost/index.js';
import { initializeBlockfrostClient } from '../../utils/blockfrost.js';
import { formatInputs, formatOutputs } from '../../utils/formatting.js';
import { getTxMetadataView } from './views/tx-metadata.js';
import { getTxView } from './views/tx.js';
import { parseCommand } from '../../utils/command.js';

export const registerTxCommand = (app: App<StringIndexed>) => {
  app.command('/tx', async ({ command, ack, say }) => {
    // Acknowledge command request
    await ack();

    const { args, options } = parseCommand(command);
    const txHash = args[0];

    const bClient = await initializeBlockfrostClient(command, options);

    if (!bClient) {
      await say(messages.CMD_LINK_PROJECT);
      return;
    }

    if (!txHash) {
      await say('Missing transaction hash.');
      return;
    }

    try {
      const tx = await bClient.getTx(txHash);

      await say(getTxView(tx, options.network, options.json));
    } catch (error) {
      const response = BlockfrostClient.handleError(error, txHash);

      await say(response);
    }
  });

  app.action('btn_tx_metadata', async ({ ack, say, action, body }) => {
    await ack();

    if (!('value' in action)) {
      // action.value with the tx hash must be present
      return;
    }

    const { txHash, network, jsonMode } = JSON.parse(action.value);

    const bClient = await initializeBlockfrostClient(body, { network });

    if (!bClient) {
      await say(messages.CMD_LINK_PROJECT);
      return;
    }

    try {
      const metadata = await bClient.getTxMetadata(txHash);

      await say(getTxMetadataView({ txHash, metadata }, network, jsonMode));
    } catch (error) {
      const response = BlockfrostClient.handleError(error, txHash);

      await say(response);
    }
  });

  app.action('btn_tx_utxo', async ({ body, ack, say, action }) => {
    // Acknowledge the action
    await ack();

    if (!('value' in action)) {
      // action.value with the tx hash must be present
      return;
    }

    const { txHash, network, jsonMode } = JSON.parse(action.value);
    const bClient = await initializeBlockfrostClient(body, { network });

    if (!bClient) {
      await say(messages.CMD_LINK_PROJECT);
      return;
    }

    try {
      const utxo = await bClient.getTxUtxo(txHash);
      const formattedInputs = formatInputs(utxo.inputs, jsonMode);
      const formattedOutputs = formatOutputs(utxo.outputs, jsonMode);
      // Slack limits the number of blocks that can be send at once to 50.
      // For now we split the inputs and outputs to separate messages.

      await say({
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: `Transaction Inputs and Outputs`,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `\`${utxo.hash}\``,
            },
          },
          ...formattedInputs,
        ],
      });

      await say({ blocks: [...formattedOutputs] });
    } catch (error) {
      const errorResponse = BlockfrostClient.handleError(error, 'no');

      await say(errorResponse);
    }
  });

  app.action('btn_tx_explorer', async ({ ack }) => {
    // Acknowledge the action
    await ack();
  });
};
