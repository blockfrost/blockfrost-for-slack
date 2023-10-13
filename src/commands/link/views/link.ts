import { WebClient } from '@slack/web-api';

export const getLinkWebhookView = async (
  client: WebClient,
  triggerId: string,
  channelId: string,
  installationId: string,
) => {
  const result = await client.views.open({
    trigger_id: triggerId,
    view: {
      private_metadata: JSON.stringify({ channelId: channelId }),
      type: 'modal',
      callback_id: 'modal-link-webhook',
      title: {
        type: 'plain_text',
        text: 'Setup Webhook',
      },
      submit: {
        // Submit button at the modal level
        type: 'plain_text',
        text: 'Submit',
      },
      blocks: [
        {
          type: 'section',
          block_id: 'step_1_block',
          text: {
            type: 'mrkdwn',
            text: `1. Add new webhook via Blockfrost Dashboard and send endpoint URL to \`bla.io/webhook-slack/${installationId}\``,
          },
        },
        {
          type: 'input',
          block_id: 'step_2_input',
          label: {
            type: 'plain_text',
            text: '2. Enter the webhook identifier',
          },
          element: {
            type: 'plain_text_input',
            action_id: 'webhook_identifier_input',
            placeholder: {
              type: 'plain_text',
              text: 'Webhook Identifier',
            },
          },
        },
        {
          type: 'input',
          block_id: 'step_3_input',
          label: {
            type: 'plain_text',
            text: '3. Enter the webhook auth token',
          },
          element: {
            type: 'plain_text_input',
            action_id: 'webhook_auth_token_input',
            placeholder: {
              type: 'plain_text',
              text: 'Auth token',
            },
          },
        },
      ],
    },
  });

  return result;
};

export const getLinkProjectView = async (
  client: WebClient,
  triggerId: string,
  channelId: string,
) => {
  const result = await client.views.open({
    trigger_id: triggerId,
    view: {
      private_metadata: JSON.stringify({ channelId: channelId }),
      type: 'modal',
      callback_id: 'modal-link-project',
      title: {
        type: 'plain_text',
        text: 'Setup project',
      },
      submit: {
        // Submit button at the modal level
        type: 'plain_text',
        text: 'Submit',
      },
      blocks: [
        {
          type: 'input',
          block_id: 'step_1_input',
          label: {
            type: 'plain_text',
            text: `Enter the 'project_id'`,
          },
          element: {
            type: 'plain_text_input',
            action_id: 'project_id_input',
            placeholder: {
              type: 'plain_text',
              text: 'project_id',
            },
          },
        },
      ],
    },
  });

  return result;
};
