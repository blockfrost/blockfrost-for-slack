import { App } from '@slack/bolt';
import { StringIndexed } from '@slack/bolt/dist/types/helpers';
import messages from '../../messages';
import { BlockfrostClient } from '../../services/blockfrost';
import { initializeBlockfrostClient } from '../../utils/blockfrost';
import { parseCommand } from '../../utils/command';
import { getAddressView } from './views/address';

export const registerAddressCommand = (app: App<StringIndexed>) => {
  app.command('/address', async ({ command, ack, say }) => {
    // Acknowledge command request
    await ack();
    const { args, options } = parseCommand(command);
    const address = args[0]?.trim();

    const bClient = await initializeBlockfrostClient(command, { network: options.network });
    if (!bClient) {
      await say(messages.CMD_LINK_PROJECT);
      return;
    }

    try {
      const addressData = await bClient.getAddress(address);
      await say(getAddressView(addressData, options.json));
    } catch (error) {
      const response = BlockfrostClient.handleError(error, command.text);
      await say(response);
    }
  });

  app.action('btn_address_explorer', async ({ ack }) => {
    // Acknowledge the action
    await ack();
  });
};
