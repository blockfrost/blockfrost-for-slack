import { App } from '@slack/bolt';
import { StringIndexed } from '@slack/bolt/dist/types/helpers';
import messages from '../../messages';
import { parseCommand } from '../../utils/command';
import { getInstallationId } from '../../utils/slack';
import { dbStore } from '../../services/db';
import { logger } from '../../utils/logger';
import { getLinkProjectView, getLinkWebhookView } from './views/link';

export const registerLinkCommand = (app: App<StringIndexed>) => {
  app.command('/link', async ({ command, ack, client, say, body }) => {
    await ack();
    const { args } = parseCommand(command);

    const [key, value] = args;
    const ALLOWED_KEYS = ['project', 'webhook'];
    if (!ALLOWED_KEYS.includes(key)) {
      await say(messages.CMD_LINK_HELP);
      return;
    }

    const installationId = getInstallationId(command, logger);

    if (key === 'project') {
      if (!value) {
        await getLinkProjectView(client, body.trigger_id, command.channel_id);
        return;
      }

      await dbStore.registerProjectId(installationId, value);
      return;
    }

    if (key === 'webhook') {
      await getLinkWebhookView(client, body.trigger_id, command.channel_id, installationId);
      return;
    }
  });

  app.view('modal-link-project', async ({ ack, body, view, client }) => {
    await ack(); // Acknowledge the event

    // Capture user input from the modal
    const values = view.state.values;

    const projectId = values.step_1_input.project_id_input.value as string;
    const privateMetadata = view.private_metadata ? JSON.parse(view.private_metadata) : null;
    const channelId = privateMetadata?.channelId;

    try {
      const installationId = getInstallationId(body, logger);
      await dbStore.registerProjectId(installationId, projectId);

      await client.chat.postMessage({
        channel: channelId,
        text: `✅ Project successfully linked!`,
      });
    } catch (error) {
      logger.error(`Error while linking project.`, error);
      await client.chat.postMessage({
        channel: channelId,
        text: `❌ Failed to link the project. Please try again.`,
      });
    }
  });

  app.view('modal-link-webhook', async ({ ack, body, view, client }) => {
    await ack(); // Acknowledge the event

    // Capture user input from the modal
    const values = view.state.values;

    const webhookIdentifier = values.step_2_input.webhook_identifier_input.value as string;
    const webhookAuthToken = values.step_3_input.webhook_auth_token_input.value as string;
    const privateMetadata = view.private_metadata ? JSON.parse(view.private_metadata) : null;
    const channelId = privateMetadata?.channelId;

    try {
      const installationId = getInstallationId(body, logger);
      await dbStore.linkWebhook(installationId, webhookIdentifier, webhookAuthToken, channelId);

      await client.chat.postMessage({
        channel: channelId,
        text: `✅ Webhook \`${webhookIdentifier}\` successfully linked!`,
      });
    } catch (error) {
      logger.error(`Error while linking webhook.`, error);
      await client.chat.postMessage({
        channel: channelId,
        text: `❌ Failed to link the webhook. Please try again.`,
      });
    }
  });
};
