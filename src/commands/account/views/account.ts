import { Responses } from '@blockfrost/blockfrost-js';
import { SayArguments } from '@slack/bolt';
import { formatUnixTimestamp, lovelaceToAda } from '../../../utils/formatting.js';
import { CardanoNetwork } from '@blockfrost/blockfrost-js/lib/types/index.js';

export const getAccountView = (
  addressData: {
    pool: Responses['pool_metadata'] | null;
    account: Responses['account_content'];
    withdrawals: (Responses['account_withdrawal_content'][number] & { block_time: number })[];
  },
  network: CardanoNetwork,
  jsonMode?: boolean,
): SayArguments => {
  const { account, withdrawals, pool } = addressData;

  if (!jsonMode) {
    return {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `Stake Account`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `\`${account.stake_address}\``,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Controlled Stake*\n${lovelaceToAda(account.controlled_amount)} ADA`,
            },
            {
              type: 'mrkdwn',
              text: `*Rewards Withdrawn*\n${lovelaceToAda(account.withdrawals_sum)} ADA`,
            },
          ],
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Rewards Available*\n${lovelaceToAda(account.withdrawable_amount)} ADA`,
            },
            {
              type: 'mrkdwn',
              text: `*Delegated to*\n${pool?.name ?? account.pool_id ?? 'No'}`,
            },
          ],
        },
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `Latest withdrawals`,
          },
        },

        ...withdrawals
          .map(withdrawal => {
            return [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `*Transaction Hash*\n\`${withdrawal.tx_hash}\``,
                },
              },
              {
                type: 'section',
                fields: [
                  {
                    type: 'mrkdwn',
                    text: `*Date*\n${formatUnixTimestamp(withdrawal.block_time)}`,
                  },
                  {
                    type: 'mrkdwn',
                    text: `*Amount*\n${lovelaceToAda(withdrawal.amount)} ADA`,
                  },
                ],
              },
              {
                type: 'divider',
              },
            ];
          })
          .flat(),
        ...(withdrawals.length === 0
          ? [
              {
                type: 'divider',
              },
            ]
          : []),
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Open in Explorer',
              },
              action_id: 'btn_account_explorer',
              url: `https://adastat.net/accounts/${account.stake_address}`,
            },
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Show Stake Pool',
              },
              action_id: 'btn_account_pool',
              value: JSON.stringify({
                pool: account.pool_id,
                network: network,
                jsonMode: jsonMode,
              }),
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
          text: `Stake Account`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `\`${account.stake_address}\``,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `\`\`\`${JSON.stringify(account, undefined, 2)}\`\`\` `,
        },
      },
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `Last withdrawals`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `\`\`\`${JSON.stringify(withdrawals, undefined, 2)}\`\`\` `,
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
            action_id: 'btn_account_explorer',
            url: `https://adastat.net/addresses/${account.stake_address}`,
          },
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Show Stake Pool',
            },
            action_id: 'btn_account_pool',
            value: JSON.stringify({ pool: account.pool_id, network: network, jsonMode: jsonMode }),
          },
        ],
      },
    ],
  };
};
