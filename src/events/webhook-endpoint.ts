import express from 'express';
import { ExpressReceiver } from '@slack/bolt';
import { WebClient } from '@slack/web-api';
import { dbStore } from '../services/db';
import { logger } from '../utils/logger';

export const registerWebhookEndpoint = (expressReceiver: ExpressReceiver) => {
  // Expose webhook endpoint
  expressReceiver.router.post('/webhook-slack/:installation', express.json(), async (req, res) => {
    // TODO validate webhook auth token
    const installationId = req.params.installation;
    const webhookId = req.body?.webhook_id;
    logger.info(
      `Received webhook request. Installation ${installationId}, webhook id ${webhookId}.`,
    );

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
};
