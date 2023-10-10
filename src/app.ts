/* eslint-disable no-console */
/* eslint-disable import/no-internal-modules */
import './utils/env';
import { App, ExpressReceiver, LogLevel } from '@slack/bolt';
import BlockfrostInstallationStore from './installation-store';
import { dbStore } from './services/db';
import { registerTxCommand } from './commands/tx/tx';
import { registerAssetCommand } from './commands/asset/asset';
import { registerLinkCommand } from './commands/link/link';
import express from 'express';
import { WebClient } from '@slack/web-api';
import { logger } from './utils/logger';
import { registerBlockCommand } from './commands/block/block';
import { registerAddressCommand } from './commands/address/address';
import { StringIndexed } from '@slack/bolt/dist/types/helpers';
import { getInstallationId } from './utils/slack';

if (!process.env.SLACK_SIGNING_SECRET) {
  throw Error('Set env variable SLACK_SIGNING_SECRET');
}

// Initialize the ExpressReceiver
const expressReceiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  stateSecret: process.env.SLACK_STATE_SECRET,
  scopes: [
    // Send messages as @Blockfrost for Slack
    'chat:write',
    // View messages and other content in private channels that Blockfrost for Slack has been added to
    'groups:history',
    // Add shortcuts and/or slash commands that people can use
    'commands',
    // View messages and other content in public channels that Blockfrost for Slack has been added to
    'channels:history',
    // Welcome message after adding user to a public channel
    'channels:read',
    // Welcome message after adding user to a private channel
    // 'groups:read',
  ],
  installationStore: new BlockfrostInstallationStore(),
});

const app = new App({
  receiver: expressReceiver,
  logLevel: LogLevel.DEBUG,
});

app.use(async ({ next }) => {
  await next();
});

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
          text: `## :wave: Welcome to Blockfrost for Slack!

This Slack app aims to provide you with seamless interactions and real-time updates from Blockfrost's blockchain services right here in Slack.

### Here's a quick rundown of what you can expect:

- **:mag: Query Blockchain Data**: Quickly fetch details of blocks, transactions, and assets without leaving Slack.
- **:bell: Real-time Alerts**: Set up webhooks to get real-time notifications for blockchain events.
- **:gear: Easy Configuration**: Link your Blockfrost projects and webhooks in just a few clicks.

### :bulb: Getting Started

1. Link your Blockfrost project with \`/link project\`.
2. Link your Blockfrost webhook for real-time updates \`/link webhook\`.
3. Type \`/blockfrost help\` to view available commands.

### :wrench: Examples

- To fetch a block: \`/block <block-hash>\`
- To fetch a transaction: \`/tx <transaction-hash>\`
  
  #### Additional Parameters:
  - Use \`--json\` to get the output in JSON format.
  - Use \`--network\` to specify the blockchain network. For example, \`/block <block-hash> --network testnet\`.


If you have any questions or run into any issues, feel free to reach out here or email us at [support@blockfrost.io](mailto:support@blockfrost.io).

### :rocket: Let's get started!`,
        });
      } catch (error) {
        console.error(error);
      }
    }
  });
};

// Expose webhook endpoint
expressReceiver.router.post('/webhook-slack/:installation', express.json(), async (req, res) => {
  // TODO validate webhook auth token
  const installationId = req.params.installation;
  const webhookId = req.body?.webhook_id;
  logger.info(`Received webhook request. Installation ${installationId}, webhook id ${webhookId}.`);

  if (!webhookId) {
    return res.json({ processed: false });
  }

  const webhook = await dbStore.getWebhook(installationId, webhookId);

  if (!webhook) {
    return res.json({ processed: false });
  }

  // Retrieve bot token for the installation from database
  const installation = await dbStore.fetchInstallation(webhook.installation_id);
  if (installation?.bot?.token) {
    // Post webhook payload to a slack channel
    const web = new WebClient(installation.bot.token);

    await web.chat.postMessage({
      channel: webhook.slack_channel,
      text: `*Received event \`${req.body.type}\` from webhook \`${req.body.webhook_id}\`*`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Received event ${req.body.type} from webhook \`${req.body.webhook_id}\`*`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `\`\`\`${JSON.stringify(req.body.payload, undefined, 2)}\`\`\``,
          },
        },
      ],
    });
  }
  return res.json({ processed: true });
});

registerLinkCommand(app);
registerTxCommand(app);
registerAssetCommand(app);
registerBlockCommand(app);
registerAddressCommand(app);

registerWelcomeMessage(app);

(async () => {
  // Start your app
  await app.start(Number(process.env.PORT) || 3000);

  console.log('⚡️ Bolt app is running!');
})();
