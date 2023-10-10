import { Responses } from '@blockfrost/blockfrost-js';
import { SayArguments } from '@slack/bolt';
import {
  formatUnixTimestamp,
  formatAssetDecimals,
  truncateLongStrings,
  lovelaceToAda,
} from '../../../utils/formatting';
import { sortAssetsDesc } from '../../../utils/cardano';

export const getAddressView = (
  addressData: {
    address: Responses['address_content_extended'];
    transactions: Responses['address_transactions_content'];
  },
  jsonMode?: boolean,
): SayArguments => {
  const { address, transactions } = addressData;
  // largest 5 holdings
  const largestAssets = sortAssetsDesc(address.amount, { excludeLovelace: true }).slice(0, 5);

  if (!jsonMode) {
    return {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `Address`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `\`${address.address}\``,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Stake Account*\n${address.stake_address}`,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*ADA Balance*\n${lovelaceToAda(
                address.amount.find(a => a.unit === 'lovelace')?.quantity ?? 0,
              )} ADA`,
            },
            {
              type: 'mrkdwn',
              text: `*Assets Count*\n${address.amount.length - 1}`,
            },
          ],
        },
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `Largest assets`,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Asset*`,
            },
            { type: 'mrkdwn', text: `*Balance*` },
          ],
        },
        ...largestAssets.map(asset => {
          return {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `${asset.unit}`,
              },
              {
                type: 'mrkdwn',
                text: `${formatAssetDecimals(asset.quantity, asset.decimals)}`,
              },
            ],
          };
        }),
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `Last transactions`,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Timestamp*`,
            },
            { type: 'mrkdwn', text: `*Tx Hash*` },
          ],
        },
        ...transactions.map(t => {
          return {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `${formatUnixTimestamp(t.block_time)}`,
              },
              {
                type: 'mrkdwn',
                text: `${t.tx_hash}`,
              },
            ],
          };
        }),
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
                text: 'Open in Explorer',
              },
              action_id: 'btn_address_explorer',
              url: `https://adastat.net/addresses/${address.address}`,
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
          text: `Address`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `\`${address.address}\``,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `\`\`\`${JSON.stringify(
            {
              ...address,
              amount: [address.amount.find(a => a.unit === 'lovelace'), '<TRUNCATED>'],
            },
            undefined,
            2,
          )}\`\`\` `,
        },
      },
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `Largest assets`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `\`\`\`${JSON.stringify(largestAssets, undefined, 2)}\`\`\` `,
        },
      },
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `Last transactions`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `\`\`\`${JSON.stringify(transactions, undefined, 2)}\`\`\` `,
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
              text: 'Open in Explorer',
            },
            action_id: 'btn_address_explorer',
            url: `https://adastat.net/addresses/${address.address}`,
          },
        ],
      },
    ],
  };
};
