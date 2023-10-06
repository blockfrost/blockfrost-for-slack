import { Responses } from '@blockfrost/blockfrost-js';
import { SayArguments } from '@slack/bolt';

export const getTxMetadataView = (
  txHash: string,
  metadata: Responses['tx_content_metadata'],
): SayArguments => {
  return {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `Metadata of Transaction`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `\`${txHash}\``,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `\`\`\`${JSON.stringify(metadata, undefined, 2)}\`\`\``,
        },
      },
    ],
  };
};
