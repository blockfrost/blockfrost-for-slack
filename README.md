# Blockfrost for Slack

Blockfrost for Slack is a toolkit for interacting with blockchain data, perfect for Cardano developers, crypto enthusiasts, and corporate teams who spent their day on Slack. The integration offers a set of slash commands that turn your Slack workspace into a versatile Cardano query terminal. Instantly query blockchain data such as assets, addresses, stake accounts, blocks, and transactions or utilize webhooks to receive real-time notifications.

## Available commands

Here's quick overview of available commands:

- `/link project`
- `/link webhook`
- `/account`
- `/address`
- `/asset`
- `/block`
- `/pool`
- `/tx`

### Output mode

When possible command output will be enhanced with user-friendly UI elements, leveraging the capabilities of the Slack Block Kit framework. For users who prefer raw data, the optional `--json` parameter allows for switching the output to JSON format.

### Multi network support

The app will include built-in support for querying data across multiple Cardano networks. Users can easily toggle between different networks by utilizing the optional `--network` parameter with relevant commands. For example, specifying `--network preview` or `--network preprod` will switch the network accordingly.

### Onboarding

Upon successful installation, the app will post welcome message wih a brief instructions on how to configure Blockfrost projects and webhooks to work with the app as well as instructions for querying blockchain data.

### `/link project [<PROJECT_ID>]`

Register Blockfrost project to enable querying data directly within the Slack App. User can register one project for each network (mainnet, preview, preprod).

After user enters the command without providing `PROJECT_ID` a modal will show up with following elements:

- Text Field with a label saying "Enter the project ID"
- Buttons: "Cancel" and "Submit"

Upon successful linking, a message appears saying, "Project successfully linked!"
If the linking fails, an error message appears saying, "Failed to link the project. Please try again."

### `/link webhook`

Register Blockfrost webhook to receive real-time events directly to a Slack channel.

After user enters the command a modal will show up with following elements:

1. Text field instructing to create a webhook via Blockfrost Dashboard
2. Input Field with a label saying "Enter the Webhook Identifier"
3. Input Field with a label saying "Enter the Webhook Auth Token"

4. Buttons: "Cancel" and "Submit"

Upon successful linking, a message appears saying, "Webhook successfully linked!"
If the linking fails, an error message appears saying, "Failed to link the webhook. Please try again."

### `/account <bech32 stake address> [--network (mainnet | preview | preprod)] [--json]`

The output of the `/account <bech32 stake address>` command, when invoked without the `--json` parameter, will display a visually formatted Slack message containing various details about the queried asset.

The output will include:

- Stake address itself
- Total controlled stake
- Rewards withdrawn
- Rewards available
- Stake pool where the account is delegating to
- The last five withdrawals, with each transaction displaying the timestamp, the tx hash and the amount withdrawn
- Buttons
  - "Open in Explorer" - Redirects the user to an external blockchain explorer web page to provide more details about the stake Account.
  - "Show Stake Pool" - Displays more information about the stake pool

### `/address <bech32 address> [--network (mainnet | preview | preprod)] [--json]`

The output of the `/address <bech32 address>` command, when invoked without the `--json` parameter, will display a visually formatted Slack message containing various details about the queried asset.

The output will include:

- Address itself
- Associated stake address
- ADA balance
- number of tokens held by the address
- The five largest assets (ranked by the quantity held)
- The last five transactions, with each transaction displaying the timestamp and transaction hash

### `/asset <hex-or-bech32> [--network (mainnet | preview | preprod)] [--json]`

The output of the `/asset <hash>` command, when invoked without the `--json` parameter, will display a visually formatted Slack message containing various details about the queried asset.

The output will include:

- asset hex
- asset fingerprint
- hash of initial mint transaction
- policy ID and asset name
- quantity
- mint and burn count
- on-chain and off-chain metadata
- if an image exists in the asset metadata, it will be rendered alongside these details.

Button "Open in Explorer" will redirect the user to an external blockchain explorer web page to provide more details about the asset.

### `/block [<hash-or-number>] [--network (mainnet | preview | preprod)] [--json]`

The output of the `/block [<hash-or-number>]` command, when invoked without the `--json` parameter, will display a visually formatted Slack message containing various details about the queried asset.

When `hash-or-number` is omitted, information about latest block is retrieved.

The output will include:

- block hash
- timestamp when the block was added to the chain
- its block height within the blockchain
- epoch and slot within that epoch
- number of confirmations for the block
- the total number of transactions included in the block
- block size
- pool that minted the block
- total output and fees

Button "Open in Explorer" will redirect the user to an external blockchain explorer web page to provide more details about the block.

### `/pool <pool_id> [--network (mainnet | preview | preprod)] [--json]`

The output of the `/pool <pool_id>` command, when invoked without the `--json` parameter, will display a visually formatted Slack message containing various details about the queried asset.

The output will include:

- Pool ID itself
- Name of the pool if pool's metadata are available
- URL to the pool's website if pool's metadata are available
- Number of minted blocks
- Number of delegators
- Fixed cost and Margin
- Committed pledge and active pledge
- Saturation and live stake
- Rewards account address
- Owners account addresses
- Buttons
  - "Open in Explorer" - Redirects the user to an external blockchain explorer web page to provide more details about the stake pool.

### `/tx <hash> [--network (mainnet | preview | preprod)] [--json]`

The output of the `/tx <hash>` command, when invoked without the `--json` parameter, will display a visually formatted Slack message containing various details about the queried transaction.

- Transaction hash - This section shows the hash of the transaction enclosed in code formatting.
- Timestamp and Block - The time at which the transaction was included in the blockchain and the block height in which it was included are displayed here.
- Slot and Fees - This section displays the slot in which the transaction was added and the transaction fees in ADA.
- Total Output and Size - Shows the total amount of ADA sent in the transaction and the size of the transaction in bytes.
- Certificates and Mints/Burns - Shows the number of different types of certificates involved in the transaction (stake, delegation, pool updates, and pool retirements), as well as any asset minting or burning activities.
- Actions - This last section provides users with a set of interactive buttons to delve further into various aspects of the transaction
  - "Show Metadata" - Shows transaction metadata
  - "Show UTXOs" - Shows inputs and outputs associated with this transaction.
  - "Open in Explorer" - Redirects the user to an external blockchain explorer web page that shows comprehensive details about the transaction

### Real-time notifications

Users can configure real-time notifications through Blockfrost webhooks to stay updated on blockchain events. Here's how to set it up:

1. Initialize Setup: Type the command `/link webhook` to trigger a configuration modal window. This modal will provide all the information you need to set up your webhook.

2. Configure on Blockfrost Dashboard: Navigate to the Blockfrost Dashboard to select the events you'd like to subscribe to and specify any conditions that must be met for the notifications to trigger.

3. Endpoint URL: Copy the URL provided in the Slack modal and paste it into the appropriate field on the Blockfrost Dashboard.

4. Enter Credentials: Fill in the webhook identifier and authentication token into the modal's input fields and save the configuration.

Once configured, any event meeting the criteria will automatically post notifications to the Slack channel where the webhook is linked.

## Installation

### Blockfrost for Slack from Slack app directory

This let's you install the app running on our servers. It's the quickest way to start!

> **Note:** Blockfrost for Slack is not yet published in the Slack App Directory. If you want to try it out, please follow the steps in [Run Your Own Slack App](#run-your-own-slack-app).

1. Go to the Slack App Directory: Open Slack and click on "Apps" in the sidebar or go directly to the Slack App Directory by navigating to [https://slack.com/apps].
2. Search for the App: Use the search bar at the top of the page to search for "Blockfrost for Slack".
3. Install the app: Click the "Install" or "Add to Slack" button.

### Run your own Slack app

This method is designed for advanced users, enabling you to deploy and manage a fully customized version of Blockfrost for Slack on your own server infrastructure. This approach offers you greater control and customization options.

To achieve this, there are two key steps you'll need to complete:

#### Initialize Your Slack App

Head over to [https://api.slack.com/apps] to create a new Slack app. During this process, you'll need to configure the app settings as required by Blockfrost for Slack.

TODO

To listen for events happening in a Slack workspace (like when a message is posted) we'll use the Events API.

We need to subscribe to following events types

- `message.channels` - listens for messages in public channels that the app is added to
- `message.groups` - listens for messages in private channels that the app is added to
- `member_joined_channel` - sent when an user joins a channel, used for sending welcome message after adding the app to a channel

#### App Deployment

1. Clone this repository and deploy the code to your own server and domain.
2. Set environment variables (See .env.sample file)
3. Initialize postgres Database with [DB Schema](#db-schema).
4. Create config file named `production.json` or `development.json` with

```json
{
  "db": {
    "connectionString": "postgres://<USER>:@<HOSTNAME>:<PORT>/<DB>"
  }
}
```

> Note: In development environment you may choose to disable SSL by adding `ssl: false` to DB configuration. However, it's important to remember that disabling SSL will result in unencrypted data transmission, which is not recommended for production use.

5. Install dependencies and start the app

```
yarn
yarn start
```

### API Endpoints

This app is using Slack's Bolt framework which automatically expose several crucial endpoints:

- `/slack/install` - Initiates the OAuth installation process for your Slack app.
- `/slack/oauth_redirect` - The redirect URL where Slack will send the user after they approve your app's requested permissions. This is where the actual OAuth token exchange happens.
- `/slack/events` - This endpoint receives all subscribed events, executed slash commands and any interactions with shortcuts, modals, or interactive components (such as buttons, select menus, and datepickers)

### Webhook endpoint

The app exposes `/installations/:installationId` endpoint, which serves as the endpoint URL for incoming webhooks that users can configure via the Blockfrost Dashboard. The origin of each incoming request is verified to prevent unauthorized access or tampering.

Payload of the webhook is send as a message to a Slack channel where the webhook was linked using `/link webhook` command.

### DB Schema

Initialize postgres database with following schema:

```sql
CREATE TABLE slack_installations (
  installation_id TEXT NOT NULL PRIMARY KEY,
  installation_data JSONB NOT NULL
);

CREATE TABLE slack_linked_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  installation_id TEXT REFERENCES slack_installations(installation_id),
  network TEXT NOT NULL,
  project_id TEXT NOT NULL,
  CONSTRAINT unique_installation_network UNIQUE (installation_id, network)
);


CREATE TABLE slack_linked_webhooks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  installation_id TEXT REFERENCES slack_installations(installation_id),
  webhook_id TEXT NOT NULL,
  webhook_auth_token TEXT,
  slack_channel TEXT NOT NULL,
  CONSTRAINT unique_installation_webhook UNIQUE (installation_id, webhook_id)
);
```

## Notes

- We do not recommend deploying this app on AWS Lambda (eg. Vercel) due to https://github.com/vercel/vercel/discussions/6039
