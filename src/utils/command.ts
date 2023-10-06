import { CardanoNetwork } from '@blockfrost/blockfrost-js/lib/types';
import { SlashCommand } from '@slack/bolt';

export const parseCommand = (command: SlashCommand) => {
  const args = [];
  const options: {
    json: boolean;
    network: CardanoNetwork;
    [any: string]: unknown;
  } = {
    json: false,
    network: 'mainnet',
  };

  const tokens = command.text.split(' ');

  let i = 0;
  while (i < tokens.length) {
    const token = tokens[i];
    if (token.startsWith('--')) {
      // store option as {key: value}, if value is not defined then fallback to true
      const paramKey = token.slice(2);
      const paramValue = tokens[i + 1]?.startsWith('--') ? true : tokens[i + 1] ?? true;

      options[paramKey] = paramValue;
      i = i + 2;
    } else {
      args.push(token);
      i++;
    }
  }

  return { args, options };
};
