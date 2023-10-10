import { App } from '@slack/bolt';
import { StringIndexed } from '@slack/bolt/dist/types/helpers';
import { dbStore } from '../services/db';
import { getInstallationId } from '../utils/slack';

export const registerWelcomeMessage = (app: App<StringIndexed>) => {
  app.event('member_joined_channel', async ({ event, client, body }) => {
    const installationId = getInstallationId(body);
    if (!installationId) {
      return;
    }

    const installation = await dbStore.fetchInstallation(installationId);

    // Check if the bot user is the one who joined the channel
    if (event.user === installation?.bot?.userId) {
      try {
        // Send a welcome message to the channel
        await client.chat.postMessage({
          channel: event.channel,
          blocks: [
            {
              type: 'header',
              text: {
                type: 'plain_text',
                text: ':wave: Welcome to Blockfrost for Slack!',
              },
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: "This Slack app aims to provide you with seamless interactions and real-time updates from Blockfrost's blockchain services right here in Slack.",
              },
            },
            {
              type: 'divider',
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: "*Here's a quick rundown of what you can expect:*",
              },
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: ':mag: *Query Blockchain Data*: Quickly fetch addresses, transactions, assets and more.\n:bell: *Real-time Alerts*: Set up webhooks to get real-time notifications for blockchain events.\n:gear: *Easy Configuration*: Link your Blockfrost projects and webhooks in just a few clicks.',
              },
            },
            {
              type: 'divider',
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: ':bulb: *Getting Started*',
              },
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: '1. Link your Blockfrost project with `/link project`.\n2. Link your Blockfrost webhook for real-time updates `/link webhook`.\n3. Type `/blockfrost help` to view available commands.',
              },
            },
            {
              type: 'divider',
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: ':wrench: *Commands*',
              },
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: '- To fetch a block: `/block [<hash-or-number>]`\n- To fetch a transaction: `/tx <hash>`\n- To fetch an asset: `/asset <hex-or-bech32>`\n- To fetch an address: `/address <bech32 address>`\n- To fetch an account: `/account <bech32 stake address>`\n\n*Additional Parameters:*\n- Use `--json` to get the output in JSON format.\n- Use `--network` to specify the blockchain network. For example, `/block <hash-or-number> --network testnet`.',
              },
            },
            {
              type: 'divider',
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: 'If you have any questions or run into any issues, feel free to reach out here or email us at <mailto:support@blockfrost.io|support@blockfrost.io>.',
              },
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: ":rocket: Let's get started!",
              },
            },
          ],
        });
      } catch (error) {
        console.error(error);
      }
    }
  });
};
