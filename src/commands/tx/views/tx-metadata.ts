import { Responses } from '@blockfrost/blockfrost-js';
import { CardanoNetwork } from '@blockfrost/blockfrost-js/lib/types/index.js';
import { SayArguments } from '@slack/bolt';

export const getTxMetadataView = (
  tx: {
    txHash: string;
    metadata: Responses['tx_content_metadata'];
  },
  _network: CardanoNetwork,
  _jsonMode?: boolean,
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
          text: `\`${tx.txHash}\``,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `\`\`\`${JSON.stringify(tx.metadata, undefined, 2)}\`\`\``,
        },
      },
    ],
  };
};
