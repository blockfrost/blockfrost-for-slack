import { Responses } from '@blockfrost/blockfrost-js';
import { SayArguments } from '@slack/bolt';
import {
  formatUnixTimestamp,
  truncateLongStrings,
  lovelaceToAda,
} from '../../../utils/formatting.js';
import { CardanoNetwork } from '@blockfrost/blockfrost-js/lib/types/index.js';

export const getTxView = (
  tx: Responses['tx_content'],
  network: CardanoNetwork,
  jsonMode?: boolean,
): SayArguments => {
  let stringifiedTx = JSON.stringify(truncateLongStrings(tx), undefined, 2);

  if (stringifiedTx.length > 3000) {
    stringifiedTx = JSON.stringify({ ...tx, output_amount: '<TRUNCATED>' }, undefined, 2);
  }

  if (!jsonMode) {
    return {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `Transaction`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `\`${tx.hash}\``,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Timestamp*\n${formatUnixTimestamp(tx.block_time)}`,
            },
            {
              type: 'mrkdwn',
              text: `*Block*\n${tx.block_height}`,
            },
          ],
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Slot*\n${tx.slot}`,
            },
            {
              type: 'mrkdwn',
              text: `*Fees*\n${lovelaceToAda(tx.fees)} ADA`,
            },
          ],
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Total Output*\n${lovelaceToAda(
                tx.output_amount.find(o => o.unit === 'lovelace')?.quantity ?? 0,
              )} ADA`,
            },
            {
              type: 'mrkdwn',
              text: `*Size*\n${tx.size} Bytes`,
            },
          ],
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Certificates*\n${
                tx.stake_cert_count +
                tx.delegation_count +
                tx.pool_update_count +
                tx.pool_retire_count
              }`,
            },
            {
              type: 'mrkdwn',
              text: `*Mints/Burns*\n${tx.asset_mint_or_burn_count}`,
            },
          ],
        },
        {
          type: 'divider',
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Show Metadata',
              },
              action_id: 'btn_tx_metadata',
              value: JSON.stringify({ txHash: tx.hash, network: network, jsonMode: jsonMode }),
            },
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Show UTXOs',
              },
              action_id: 'btn_tx_utxo',
              value: JSON.stringify({ txHash: tx.hash, network: network, jsonMode: jsonMode }),
            },
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Open in Explorer',
              },
              action_id: 'btn_tx_explorer',
              url: `https://adastat.net/transactions/${tx.hash}`,
            },
          ],
        },
      ],
    };
  }

  return {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `Transaction`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `\`${tx.hash}\``,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `\`\`\`${stringifiedTx}\`\`\` `,
        },
      },
      {
        type: 'divider',
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Show Metadata',
            },
            action_id: 'btn_tx_metadata',
            value: JSON.stringify({ txHash: tx.hash, network: network, jsonMode: jsonMode }),
          },
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Show UTXOs',
            },
            action_id: 'btn_tx_utxo',
            value: JSON.stringify({ txHash: tx.hash, network: network, jsonMode: jsonMode }),
          },
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Open in Explorer',
            },
            action_id: 'btn_tx_explorer',
            url: `https://adastat.net/transactions/${tx.hash}`,
          },
        ],
      },
    ],
  };
};
