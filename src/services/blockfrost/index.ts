import {
  BlockFrostAPI,
  BlockfrostClientError,
  BlockfrostServerError,
} from '@blockfrost/blockfrost-js';

export class BlockfrostClient {
  client: BlockFrostAPI;

  constructor(projectId: string) {
    this.client = new BlockFrostAPI({
      projectId: projectId,
      rateLimiter: true,
    });
  }

  getAccount = async (stakeAccount: string) => {
    const account = await this.client.accounts(stakeAccount);
    const withdrawals = await this.client.accountsWithdrawals(stakeAccount, {
      order: 'desc',
      count: 5,
    });
    const withdrawalsTxs = await Promise.all(withdrawals.map(w => this.client.txs(w.tx_hash)));
    const withdrawalsWithTimestamp = withdrawals.map((w, index) => ({
      ...w,
      block_time: withdrawalsTxs[index].block_time,
    }));

    const pool = account.pool_id ? await this.client.poolMetadata(account.pool_id) : null;
    return { account, withdrawals: withdrawalsWithTimestamp, pool };
  };

  getAddress = async (address: string) => {
    const addressData = await this.client.addressesExtended(address);
    const transactions = await this.client.addressesTransactions(address, {
      order: 'desc',
      count: 5,
    });
    return { address: addressData, transactions };
  };

  getAsset = async (asset: string) => {
    const res = await this.client.assetsById(asset);
    return res;
  };

  getBlock = async (hashOrNumber?: string | number) => {
    return hashOrNumber === undefined || hashOrNumber === ''
      ? this.client.blocksLatest()
      : this.client.blocks(hashOrNumber);
  };

  getPool = async (poolId: string) => {
    try {
      const pool = await this.client.poolsById(poolId);
      const metadata = await this.client.poolMetadata(poolId);

      return { pool, metadata };
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Failed to fetch pool ${poolId}`, error.message);
      }
      throw error;
    }
  };

  getTx = async (txHash: string) => {
    const res = await this.client.txs(txHash);
    return res;
  };

  getTxUtxo = async (txHash: string) => {
    const res = await this.client.txsUtxos(txHash);
    return res;
  };

  getTxMetadata = async (txHash: string) => {
    const res = await this.client.txsMetadata(txHash);
    return res;
  };

  static handleError = (error: unknown, resourceId: string) => {
    if (error instanceof BlockfrostClientError) {
      // TODO: log errors
      // We don't want to expose BlockfrostClientError to the end user
      // as it points out the problem with our infrastructure out of user's control.
      return {
        text: `Failed to retrieve the resource ${resourceId}. Please try again later.`,
      };
    } else {
      const errorMessage =
        error instanceof BlockfrostServerError ? `${error.status_code} ${error.message}` : error;

      return {
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `Failed to retrieve the resource ${resourceId}.`,
            },
          },
          {
            type: 'rich_text',
            elements: [
              {
                type: 'rich_text_quote',
                elements: [
                  {
                    type: 'text',
                    text: JSON.stringify(errorMessage, undefined, 2),
                  },
                ],
              },
            ],
          },
        ],
        text: `Failed to retrieve the resource ${resourceId}.`,
      };
    }
  };
}
