/* eslint-disable no-console */
/* eslint-disable import/no-internal-modules */
import './utils/env';
import { App, ExpressReceiver, LogLevel } from '@slack/bolt';
import BlockfrostInstallationStore from './installation-store';
import { registerTxCommand } from './commands/tx/tx';
import { registerAssetCommand } from './commands/asset/asset';
import { registerLinkCommand } from './commands/link/link';
import { registerBlockCommand } from './commands/block/block';
import { registerAddressCommand } from './commands/address/address';
import { registerWelcomeMessage } from './events/welcome-message';
import { registerWebhookEndpoint } from './events/webhook-endpoint';
import { registerAccountCommand } from './commands/account/account';
import { registerPoolCommand } from './commands/pool/pool';

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

registerLinkCommand(app);
registerTxCommand(app);
registerAssetCommand(app);
registerBlockCommand(app);
registerAddressCommand(app);
registerAccountCommand(app);
registerPoolCommand(app);

registerWelcomeMessage(app);
registerWebhookEndpoint(expressReceiver);

(async () => {
  // Start your app
  await app.start(Number(process.env.PORT) || 3000);

  console.log('⚡️ Bolt app is running!');
})();
