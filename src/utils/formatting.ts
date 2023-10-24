import { Responses } from '@blockfrost/blockfrost-js';
import { SayArguments } from '@slack/bolt';
import { format } from 'date-fns';

export const formatAssetDecimals = (quantity: number | string, decimals: number | null): number => {
  if (typeof quantity === 'string') {
    quantity = Number(quantity);
  }

  if (decimals === null) {
    return quantity;
  }

  if (typeof quantity !== 'number' || isNaN(quantity)) {
    throw new Error(
      'Invalid input: Quantity should be a number or a string that can be converted to a number.',
    );
  }

  return quantity / 10 ** decimals;
};

export const lovelaceToAda = (lovelace: number | string) => {
  return formatAssetDecimals(lovelace, 6);
};

export const formatInputs = (inputs: Responses['tx_content_utxo']['inputs'], jsonMode: boolean) => {
  if (!jsonMode) {
    return inputs
      .map((input, index) => {
        const amount =
          BigInt(input.amount.find(a => a.unit === 'lovelace')?.quantity ?? '0') / 100000000n;
        const tokens = input.amount.filter(amount => amount.unit !== 'lovelace');

        const response: SayArguments['blocks'] = [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: `Input #${index + 1}`,
            },
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Tx Hash*\n\`${input.tx_hash}\``,
              },
              {
                type: 'mrkdwn',
                text: `*Index*\n${input.output_index}`,
              },
            ],
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `📘 *Address*\n\`${input.address}\``,
            },
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Amount*\n${amount} ADA`,
              },
              {
                type: 'mrkdwn',
                text: `*Collateral*\n${input.collateral ? 'Yes' : 'No'}`,
              },
            ],
          },
        ];

        if (tokens.length > 0) {
          // Append tokens block
          response.push({
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Assets*\n\`\`\`${JSON.stringify(tokens, undefined, 2)}\`\`\``,
            },
          });
        }
        response.push({
          type: 'divider',
        });

        return response;
      })
      .flat();
  } else {
    // JSON mode
    return [
      ...inputs.map((input, index) => {
        return {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Input #${index + 1}*\n\`\`\`${JSON.stringify(input, undefined, 2)}\`\`\``,
          },
        };
      }),
      {
        type: 'divider',
      },
    ];
  }
};

export const formatOutputs = (
  outputs: Responses['tx_content_utxo']['outputs'],
  jsonMode: boolean,
) => {
  if (!jsonMode) {
    return outputs
      .map((output, index) => {
        const amount =
          BigInt(output.amount.find(a => a.unit === 'lovelace')?.quantity ?? '0') / 100000000n;
        const tokens = output.amount.filter(amount => amount.unit !== 'lovelace');

        const response: SayArguments['blocks'] = [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: `Output #${index + 1}`,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `📘 *Address*\n\`${output.address}\``,
            },
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Amount*\n${amount} ADA`,
              },
              {
                type: 'mrkdwn',
                text: `*Collateral*\n${output.collateral ? 'Yes' : 'No'}`,
              },
            ],
          },
        ];

        if (tokens.length > 0) {
          // Append tokens block
          response.push({
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Assets*\n\`\`\`${JSON.stringify(tokens, undefined, 2)}\`\`\``,
            },
          });
        }
        response.push({
          type: 'divider',
        });

        return response;
      })
      .flat();
  } else {
    return [
      ...outputs.map((output, index) => {
        return {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Output #${index + 1}*\n\`\`\`${JSON.stringify(output, undefined, 2)}\`\`\``,
          },
        };
      }),
      {
        type: 'divider',
      },
    ];
  }
};

export const formatUnixTimestamp = (ts: number) => {
  return format(new Date(ts * 1000), 'yyyy-MM-dd HH:mm:ss');
};

export const truncateLongStrings = <T>(obj: T): T => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(element => truncateLongStrings(element)) as T;
  }

  // Handle objects
  const newObj: { [key: string]: unknown } = {};

  for (const key in obj) {
    if (Object.hasOwn(obj, key)) {
      const value = obj[key];

      if (typeof value === 'string' && value.length > 500) {
        newObj[key] = `${value.substring(0, 500)}...<TRUNCATED>`;
      } else if (typeof value === 'object') {
        newObj[key] = truncateLongStrings(value);
      } else {
        newObj[key] = value;
      }
    }
  }

  return newObj as T;
};
