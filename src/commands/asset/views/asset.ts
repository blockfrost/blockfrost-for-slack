import { Responses } from '@blockfrost/blockfrost-js';
import { SayArguments } from '@slack/bolt';
import { truncateLongStrings } from '../../../utils/formatter';
import { logger } from '../../../utils/logger';

export const isResourceUriSupported = (uri: string) => {
  const SUPPORTED_PROTOCOLS = ['ipfs', 'http', 'https'];

  for (const protocol of SUPPORTED_PROTOCOLS) {
    if (uri.startsWith(`${protocol}://`)) {
      return true;
    }
  }
  return false;
};

export const getImageFromMetadata = (metadata: any): string[] => {
  if (!metadata) {
    return [];
  }

  const images: string[] = [];

  if (Array.isArray(metadata.image)) {
    const joinedSrc = metadata.image.join('');
    images.push(joinedSrc);
  } else if (typeof metadata.image === 'string') {
    images.push(metadata.image);
  }

  if (Array.isArray(metadata.files)) {
    for (const file of metadata.files) {
      if (typeof file.src === 'string') {
        images.push(file.src);
      } else if (Array.isArray(file.src)) {
        const joinedSrc = file.src.join('') as string;
        images.push(joinedSrc);
      }
    }
  }

  const uniqueImages = new Set<string>();
  for (const image of images) {
    if (isResourceUriSupported(image)) {
      uniqueImages.add(image);
    } else {
      logger.info(`Ignoring unknown URI format.`, image);
    }
  }

  return [...uniqueImages];
};

export const getAssetView = (asset: Responses['asset'], jsonMode?: boolean): SayArguments => {
  if (asset.metadata?.logo && asset.metadata.logo.length > 1000) {
    // Slack limits length of the response to 3000 chars.
    // If metadata.logo is too large then truncate it
    asset.metadata.logo = `${asset.metadata.logo.slice(0, 1000)}...<TRUNCATED>`;
  }

  // TODO: smarter way to auto truncate objects
  // asset.onchain_metadata can be an object where value is array of strings
  // so truncateLongStrings won't work
  const onchainMetadataString = JSON.stringify(
    truncateLongStrings(asset.onchain_metadata),
    undefined,
    2,
  );
  // if (onchainMetadataString.length > 1000) {
  //   // @ts-expect-error storing string instead of object
  //   // asset.onchain_metadata = onchainMetadataString.substring(0, 1000);
  // }

  const offchainMetadataString = JSON.stringify(truncateLongStrings(asset.metadata), undefined, 2);

  const onchainLogo = getImageFromMetadata(asset.onchain_metadata);
  const offchainLogo = getImageFromMetadata(asset.metadata);
  const logo = onchainLogo[0] ?? offchainLogo[0];
  const logoUrl = logo.startsWith('ipfs')
    ? `https://ipfs.blockfrost.dev/ipfs/${logo.substring(6)}`
    : logo;

  if (!jsonMode) {
    return {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `Asset`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `\`${asset.asset}\``,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Fingerprint:*\n\`${asset.fingerprint}\``,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Policy:*\n\`${asset.policy_id}\``,
            },
            {
              type: 'mrkdwn',
              text: `*Name:*\n\`${asset.asset_name}\``,
            },
          ],
          accessory: {
            type: 'image',
            image_url: logoUrl,
            alt_text: 'asset logo',
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Mint Tx:*\n\`${asset.initial_mint_tx_hash}\``,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Quantity:*\n${asset.quantity}`,
            },
            {
              type: 'mrkdwn',
              text: `*Mint/Burn Count:*\n${asset.mint_or_burn_count}`,
            },
          ],
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*On-chain Metadata:*\n\`${
              asset.onchain_metadata ? `\`\`\`${onchainMetadataString}\`\`\`` : 'No'
            }\``,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Off-chain Metadata:*\n\`${
              asset.metadata ? `\`\`\`${offchainMetadataString}\`\`\`` : 'No'
            }\``,
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
              action_id: 'btn_asset_explorer',
              url: `https://adastat.net/tokens/${asset.asset}`,
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
          text: `Asset`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `\`${asset.fingerprint}\``,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `\`\`\`${JSON.stringify(asset, undefined, 2)}\`\`\` `,
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
            action_id: 'btn_asset_explorer',
            url: `https://adastat.net/tokens/${asset.asset}`,
          },
        ],
      },
    ],
  };
};
