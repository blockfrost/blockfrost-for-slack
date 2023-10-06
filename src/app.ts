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
  ],
  installationStore: new BlockfrostInstallationStore(),
});

const app = new App({
  // signingSecret: process.env.SLACK_SIGNING_SECRET,
  // clientId: process.env.SLACK_CLIENT_ID,
  // clientSecret: process.env.SLACK_CLIENT_SECRET,
  // stateSecret: process.env.SLACK_STATE_SECRET,
  receiver: expressReceiver,
  logLevel: LogLevel.DEBUG,
});

app.use(async ({ next }) => {
  await next();
});

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

(async () => {
  // Start your app
  await app.start(Number(process.env.PORT) || 3000);

  console.log('⚡️ Bolt app is running!');
})();
