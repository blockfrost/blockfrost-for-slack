import { Responses } from '@blockfrost/blockfrost-js';
import { SayArguments } from '@slack/bolt';
import { lovelaceToAda } from '../../../utils/formatting';
import { CardanoNetwork } from '@blockfrost/blockfrost-js/lib/types';

export const getPoolView = (
  poolData: { pool: Responses['pool']; metadata: Responses['pool_metadata'] },
  network: CardanoNetwork,
  jsonMode?: boolean,
): SayArguments => {
  const { pool, metadata } = poolData;
  if (!jsonMode) {
    return {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `Stake Pool`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `\`${pool.pool_id}\``,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Name*\n${metadata.name}`,
            },
            {
              type: 'mrkdwn',
              text: `*Website*\n<${metadata.homepage}>`,
            },
          ],
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Blocks Minted*\n${pool.blocks_minted}`,
            },
            {
              type: 'mrkdwn',
              text: `*Delegators*\n${pool.live_delegators}`,
            },
          ],
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Fixed Cost*\n${lovelaceToAda(pool.fixed_cost)} ADA`,
            },

            {
              type: 'mrkdwn',
              text: `*Margin*\n${pool.margin_cost * 100}%`,
            },
          ],
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Committed Pledge*\n${lovelaceToAda(pool.declared_pledge)} ADA`,
            },
            {
              type: 'mrkdwn',
              text: `*Active Pledge*\n${lovelaceToAda(pool.live_pledge)} ADA`,
            },
          ],
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Saturation*\n${pool.live_saturation * 100}%`,
            },
            {
              type: 'mrkdwn',
              text: `*Live Stake*\n${lovelaceToAda(pool.live_stake)} ADA`,
            },
          ],
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Rewards Account*\n${pool.reward_account}`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Owners*\n${pool.owners.join('\n')}`,
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
              action_id: 'btn_pool_explorer',
              url: `https://adastat.net/pools/${pool.pool_id}`,
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
          text: `Pool`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `\`${pool.pool_id}\``,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `\`\`\`${JSON.stringify(pool, undefined, 2)}\`\`\` `,
        },
      },
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `Pool Metadata`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `\`\`\`${JSON.stringify(metadata, undefined, 2)}\`\`\` `,
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
            action_id: 'btn_pool_explorer',
            url: `https://adastat.net/pools/${pool.pool_id}`,
          },
        ],
      },
    ],
  };
};
