import { App } from '@slack/bolt';
import { StringIndexed } from '@slack/bolt/dist/types/helpers';
import messages from '../../messages';
import { BlockfrostClient } from '../../services/blockfrost';
import { initializeBlockfrostClient } from '../../utils/blockfrost';
import { formatInputs, formatOutputs } from '../../utils/formatter';
import { getTxMetadataView } from './views/tx-metadata';
import { getTxView } from './views/tx';
import { parseCommand } from '../../utils/command';

export const registerTxCommand = (app: App<StringIndexed>) => {
  app.command('/tx', async ({ command, ack, respond, say }) => {
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
    const metadata = await bClient.getTxMetadata(txHash);

    await say(getTxMetadataView(txHash, metadata));
    try {
    } catch (error) {
      const response = BlockfrostClient.handleError(error, 'a');
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

    const utxo = await bClient.getTxUtxo(txHash);
    const formattedInputs = formatInputs(utxo.inputs);
    const formattedOutputs = formatOutputs(utxo.outputs);

    // Slack limits the number of blocks that can be send at once to 50.
    // For now we split the inputs and outputs to separate messages.
    // TODO: Handle large transaction with more than 50 inputs or outputs
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
    try {
    } catch (error) {
      const errorResponse = BlockfrostClient.handleError(error, 'no');
      await say(errorResponse);
    }
  });

  app.action('btn_tx_explorer', async ({ body, ack, say }) => {
    // Acknowledge the action
    await ack();
  });
};
