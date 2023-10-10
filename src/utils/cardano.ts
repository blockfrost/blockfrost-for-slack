import { Responses } from '@blockfrost/blockfrost-js';

export const sortAssetsDesc = <T extends Responses['tx_content']['output_amount']>(
  assets: T,
  options: {
    excludeLovelace: boolean;
  },
): T => {
  return assets
    .filter(a => (options.excludeLovelace ? a.unit !== 'lovelace' : true))
    .sort((a, b) => {
      const aBig = BigInt(a.quantity);
      const bBig = BigInt(b.quantity);
      if (aBig < bBig) return 1;
      if (aBig > bBig) return -1;
      return 0;
    }) as T;
};
