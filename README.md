# Blockfrost for Slack

Blockfrost for Slack is a toolkit for interacting with blockchain data, perfect for Cardano developers, crypto enthusiasts, and corporate teams who spent their day on Slack. The integration offers a set of slash commands that turn your Slack workspace into a versatile Cardano query terminal. Instantly query blockchain data such as assets, addresses, stake accounts, blocks, and transactions or utilize webhooks to receive real-time notifications.

## Event Subscription and Connection Modes

To listen for events happening in a Slack workspace (like when a message is posted) we'll use the Events API.

We need to subscribe to following events types

- `message.channels` - listens for messages in public channels that the app is added to
- `message.groups` - listens for messages in private channels that the app is added to

There are 2 ways that the app can communicate with the Slack API - Socket mode and HTTP mode[^connection-modes].

[^connection-modes]: https://api.slack.com/apis/connections

### Socket mode

Socket Mode allows to receive events through a private WebSocket, instead of a direct HTTP subscription to events. WebSockets use a bidirectional stateful protocol with low latency to communicate between two parties.

Socket mode is a quick and easy way to get up and running, especially for local development or in an environment where it's hard to expose a public HTTP endpoint.

Apps using Socket Mode are not currently allowed in the public Slack App Directory.[^socket-mode]

[^socket-mode]: https://api.slack.com/apis/connections/socket

### HTTP mode

We'll create a public HTTP endpoint that our app listens on, choose what events to subscribe to and Slack will send HTTP POST requests with relevant events to the endpoint.

HTTP mode is ideal for building a large-scale application that are meant to be distributed across multiple instances or regions, and require more control over the handling of incoming requests.

This method of communication is mandatory for publishing and distributing an app via the Slack App Directory.[^http-mode]

For our app, HTTP mode appears to be the more suitable choice.

[^http-mode]: https://api.slack.com/apis/connections#events

## Sending and responding to actions

### Slash commands

Slash commands enable users to interact with an app from within Slack.
Each command needs to be enabled and configured in the app configuration.[^command]
This will be the primary way to interact with the app.

[^command]: https://api.slack.com/interactivity/slash-commands

### UI elements

To use features like buttons, select menus, datepickers, modals, and shortcuts, we'll need to enable interactivity in the Slack app configuration.
Similar to events, we need to specify a Request URL for Slack to send the action (such as user clicked a button).[^ui-elements]

[^ui-elements]: https://slack.dev/bolt-js/tutorial/getting-started-http#sending-and-responding-to-actions

## Tokens and installing apps

By default, newly built Slack apps can only be installed in their associated workspace.

For distributing the app publicly the app needs to implement OAuth 2.0 flow. With OAuth, the app will be able to generate access tokens for each workspace and user on the fly and allows for simple one-click installation.[^distributing]

### OAuth 2.0

OAuth 2.0 is a protocol that lets the app request authorization to private details in a user's Slack account without getting their password. It's also the vehicle by which Slack apps are installed on a team. The app asks for specific permission scopes and is rewarded with access tokens upon a user's approval.[^oauth]

[^distributing]: https://api.slack.com/start/distributing
[^oauth]: https://api.slack.com/authentication/oauth-v2

### Slack Bot Token

During OAuth flow, the Slack API issues a Bot User Token upon successful authorization of the app. This token acts as the "passport" for the bot to interact with the Slack API, effectively granting it permissions to perform various actions within a workspace, such as posting messages or listening to events. Each installation of the app across different Slack workspaces will generate a unique Bot User Token, which is dynamically created and should be securely stored for subsequent API interactions.[^oauth]

## UI/UX

The range of UI/UX possibilities is somewhat constrained by the limitations of Slack's Block Kit framework. Block Kit does provide a set of basic interactive components like buttons, dropdowns, and modals, but it lacks the flexibility for creating rich, custom layouts compared to a full-featured web app. The UI elements are largely predefined, and customization options are limited. This means that while we can create functional and straightforward interfaces, our ability to deliver a highly customized user experience is restricted. Overall, our focus remains on simple, text-based interactions within the conversational context of Slack.

### Limitations

Here is a brief list of limitations that restricts our ability to create a rich user interfaces

- Lack of table layout
- Message layout is limited to the maximum of 2 columns
- Message with interactive components has fixed width
- Inability to control text-wrapping
- Limit of 50 UI blocks per message
- Limit of 3000 characters in a block

To work around these limitations we'll be forced to truncate long output (such as list of assets held by an address/account).

### Output mode

When possible command output will be enhanced with user-friendly UI elements, leveraging the capabilities of the Slack Block Kit framework. For users who prefer raw data, the optional `--json` parameter allows for switching the output to JSON format.

### Multi network support

The app will include built-in support for querying data across multiple Cardano networks. Users can easily toggle between different networks by utilizing the optional `--network` parameter with relevant commands. For example, specifying `--network preview` or `--network preprod` will switch the network accordingly.

### Onboarding

Upon successful installation, the app will post welcome message wih a brief instructions on how to configure Blockfrost projects and webhooks to work with the app as well as instructions for querying blockchain data.

### Available commands

Here's quick overview of available commands:

- `/link project`
- `/link webhook`
- `/account`
- `/address`
- `/asset`
- `/block`
- `/pool`
- `/tx`

#### `/link project [<PROJECT_ID>]`

Register Blockfrost project to enable querying data directly within the Slack App. User can register one project for each network (mainnet, preview, preprod).

After user enters the command without providing `PROJECT_ID` a modal will show up with following elements:

- Text Field with a label saying "Enter the project ID"
- Buttons: "Cancel" and "Submit"

Upon successful linking, a message appears saying, "Webhook successfully linked!"
If the linking fails, an error message appears saying, "Failed to link the webhook. Please try again."

#### `/link webhook`

Register Blockfrost webhook to receive real-time events directly to a Slack channel.

After user enters the command a modal will show up with following elements:

1. Text field instructing to create a webhook via Blockfrost Dashboard
2. Input Field with a label saying "Enter the Webhook Identifier"
3. Input Field with a label saying "Enter the Webhook Auth Token"

4. Buttons: "Cancel" and "Submit"

Upon successful linking, a message appears saying, "Webhook successfully linked!"
If the linking fails, an error message appears saying, "Failed to link the webhook. Please try again."

#### `/account <bech32 stake address> [--network (mainnet | preview | preprod)] [--json]`

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

#### `/address <bech32 address> [--network (mainnet | preview | preprod)] [--json]`

The output of the `/address <bech32 address>` command, when invoked without the `--json` parameter, will display a visually formatted Slack message containing various details about the queried asset.

The output will include:

- Address itself
- Associated stake address
- ADA balance
- number of tokens held by the address
- The five largest assets (ranked by the quantity held)
- The last five transactions, with each transaction displaying the timestamp and transaction hash

#### `/asset <hex-or-bech32> [--network (mainnet | preview | preprod)] [--json]`

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

#### `/block [<hash-or-number>] [--network (mainnet | preview | preprod)] [--json]`

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

#### `/pool <pool_id> [--network (mainnet | preview | preprod)] [--json]`

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

#### `/tx <hash> [--network (mainnet | preview | preprod)] [--json]`

The output of the `/tx <hash>` command, when invoked without the `--json` parameter, will display a visually formatted Slack message containing various details about the queried transaction.

1. Transaction hash - This section shows the hash of the transaction enclosed in code formatting.
2. Timestamp and Block - The time at which the transaction was included in the blockchain and the block height in which it was included are displayed here.
3. Slot and Fees - This section displays the slot in which the transaction was added and the transaction fees in ADA.
4. Total Output and Size - Shows the total amount of ADA sent in the transaction and the size of the transaction in bytes.
5. Certificates and Mints/Burns - Shows the number of different types of certificates involved in the transaction (stake, delegation, pool updates, and pool retirements), as well as any asset minting or burning activities.
6. Actions - This last section provides users with a set of interactive buttons to delve further into various aspects of the transaction
   - "Show Metadata" - Shows transaction metadata
   - "Show UTXOs" - Shows inputs and outputs associated with this transaction.
   - "Open in Explorer" - Redirects the user to an external blockchain explorer web page that shows comprehensive details about the transaction

#### Real-time notifications

Users can configure real-time notifications through Blockfrost webhooks to stay updated on blockchain events. Here's how to set it up:

1. Initialize Setup: Type the command `/link webhook` to trigger a configuration modal window. This modal will provide all the information you need to set up your webhook.

2. Configure on Blockfrost Dashboard: Navigate to the Blockfrost Dashboard to select the events you'd like to subscribe to and specify any conditions that must be met for the notifications to trigger.

3. Endpoint URL: Copy the URL provided in the Slack modal and paste it into the appropriate field on the Blockfrost Dashboard.

4. Enter Credentials: Fill in the webhook identifier and authentication token into the modal's input fields and save the configuration.

Once configured, any event meeting the criteria will automatically post notifications to the Slack channel where the webhook is linked.

## Backend

### Webhook endpoint

### DB Schema

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
