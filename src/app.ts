/* eslint-disable no-console */
/* eslint-disable import/no-internal-modules */
// eslint-disable-next-line import/extensions
import 'dotenv/config';
import bolt from '@slack/bolt';
import BlockfrostInstallationStore from './installation-store/index.js';
import { registerTxCommand } from './commands/tx/tx.js';
import { registerAssetCommand } from './commands/asset/asset.js';
import { registerLinkCommand } from './commands/link/link.js';
import { registerBlockCommand } from './commands/block/block.js';
import { registerAddressCommand } from './commands/address/address.js';
import { registerWelcomeMessage } from './events/welcome-message.js';
import { registerWebhookEndpoint } from './events/webhook-endpoint.js';
import { registerAccountCommand } from './commands/account/account.js';
import { registerPoolCommand } from './commands/pool/pool.js';
import { registerBlockfrostHelpCommand } from './commands/blockfrost-help/blockfrost-help.js';
const { App, ExpressReceiver, LogLevel } = bolt;

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
registerBlockfrostHelpCommand(app);

registerWelcomeMessage(app);
registerWebhookEndpoint(expressReceiver);

(async () => {
  // Start your app
  await app.start(Number(process.env.PORT) || 3000);

  console.log('⚡️ Bolt app is running!');
})();
