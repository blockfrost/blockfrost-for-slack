import express from 'express';
import { ExpressReceiver } from '@slack/bolt';
import { WebClient } from '@slack/web-api';
import { dbStore } from '../services/db';
import { logger } from '../utils/logger';
import { SignatureVerificationError, verifyWebhookSignature } from '@blockfrost/blockfrost-js';

export const registerWebhookEndpoint = (expressReceiver: ExpressReceiver) => {
  // Expose webhook endpoint
  expressReceiver.router.post('/installations/:installation', express.json(), async (req, res) => {
    const installationId = req.params.installation;
    const webhookId = req.body?.webhook_id;
    logger.info(
      `Received webhook request. Installation ${installationId}, webhook id ${webhookId}.`,
    );

    if (!webhookId) {
      return res.status(400).send('Missing webhook_id in request body.');
    }

    // Validate webhook signature
    const webhook = await dbStore.getWebhook(installationId, webhookId);
    if (!webhook) {
      return res
        .status(400)
        .send('Unknown webhook. Link the webhook using Slack command /link webhook.');
    }

    // Validate the webhook signature
    const signatureHeader = req.headers['blockfrost-signature'];
    if (!signatureHeader) {
      return res.status(400).send('Missing signature header.');
    }

    try {
      verifyWebhookSignature(
        JSON.stringify(req.body), // Stringified request.body (Note: In AWS Lambda you don't need to call JSON.stringify as event.body is already stringified)
        signatureHeader,
        webhook.webhook_auth_token,
        600, // Optional param to customize maximum allowed age of the webhook event, defaults to 600s
      );
    } catch (error) {
      if (error instanceof SignatureVerificationError) {
        return res.status(400).send('Signature is not valid!');
      } else {
        logger.error(`Error while validating webhook request`, error);
        return res.status(400).send('Error while validating request.');
      }
    }

    // Retrieve bot token for the installation from database
    const installation = await dbStore.fetchInstallation(webhook.installation_id);

    if (!installation) {
      return res
        .status(400)
        .send(
          'Could not find configuration for your installation. Please verify that the endpoint URL is correct.',
        );
    }

    if (installation.bot?.token) {
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
      return res.json({ processed: true });
    }
    return res.json({ processed: false });
  });
};
