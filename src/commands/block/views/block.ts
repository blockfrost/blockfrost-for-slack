import { Responses } from '@blockfrost/blockfrost-js';
import { SayArguments } from '@slack/bolt';
import { formatUnixTimestamp, lovelaceToAda } from '../../../utils/formatting.js';

export const getBlockView = (
  block: Responses['block_content'],
  jsonMode?: boolean,
): SayArguments => {
  if (!jsonMode) {
    return {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `Block`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `\`${block.hash}\``,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Timestamp:\n${formatUnixTimestamp(block.time)}`,
            },
            {
              type: 'mrkdwn',
              text: `*Height:\n${block.height}`,
            },
          ],
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Slot:\n${block.slot}`,
            },
            {
              type: 'mrkdwn',
              text: `*Epoch/Slot:\n${block.epoch}/${block.epoch_slot}`,
            },
          ],
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Confirmations:\n${block.confirmations}`,
            },
            {
              type: 'mrkdwn',
              text: `*Transactions:\n${block.tx_count}`,
            },
          ],
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Pool:\n\`${block.slot_leader}\``,
            },
            {
              type: 'mrkdwn',
              text: `*Size:\n${block.size} Bytes`,
            },
          ],
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Total Output:\n${lovelaceToAda(block.output ?? 0)} ADA`,
            },
            {
              type: 'mrkdwn',
              text: `*Total Fee:\n${lovelaceToAda(block.fees ?? 0)} ADA`,
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
                text: 'Open in Explorer',
              },
              action_id: 'btn_block_explorer',
              url: `https://adastat.net/blocks/${block.hash}`,
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
          text: `Block`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `\`${block.hash}\``,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `\`\`\`${JSON.stringify(block, undefined, 2)}\`\`\` `,
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
            action_id: 'btn_block_explorer',
            url: `https://adastat.net/block/${block.hash}`,
          },
        ],
      },
    ],
  };
};
