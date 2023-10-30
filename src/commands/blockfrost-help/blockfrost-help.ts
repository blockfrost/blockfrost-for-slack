import { App } from '@slack/bolt';
import { StringIndexed } from '@slack/bolt/dist/types/helpers.js';
import messages from '../../messages.js';
import { BlockfrostClient } from '../../services/blockfrost/index.js';
import { parseCommand } from '../../utils/command.js';
import { getWelcomeMessage } from '../../events/welcome-message.js';

export const registerBlockfrostHelpCommand = (app: App<StringIndexed>) => {
  app.command('/blockfrost', async ({ command, ack, client, say }) => {
    // Acknowledge command request
    await ack();
    const { args } = parseCommand(command);
    const subCommand = args[0]?.trim();

    if (!subCommand) {
      await say(messages.CMD_UNKNOWN_COMMAND);
      return;
    }

    try {
      await client.chat.postEphemeral({
        channel: command.channel_id,
        user: command.user_id,
        blocks: getWelcomeMessage(),
      });
    } catch (error) {
      const response = BlockfrostClient.handleError(error, command.text);

      await client.chat.postEphemeral({
        channel: command.channel_id,
        user: command.user_id,
        ...response,
      });
    }
  });
};
