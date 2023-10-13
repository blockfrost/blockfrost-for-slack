import { EnvelopedEvent, SlackAction, SlackViewAction, SlashCommand } from '@slack/bolt';
import { logger as defaultLogger } from './logger.js';

export const getInstallationId = (
  commandOrAction: SlashCommand | SlackAction | SlackViewAction | EnvelopedEvent,
  logger = defaultLogger,
) => {
  if ('enterprise_id' in commandOrAction || 'team_id' in commandOrAction) {
    const enterpriseId = commandOrAction.enterprise_id;
    const teamId = commandOrAction.team_id;
    const installationId = enterpriseId ?? teamId;

    return installationId;
  } else {
    const enterpriseId = commandOrAction.enterprise?.id;
    const teamId = commandOrAction.team?.id;
    const installationId = enterpriseId ?? teamId;

    if (!installationId) {
      logger?.error(`Could not extract installation id.`, commandOrAction);
      throw Error(`ERR_UNKNOWN_INSTALLATION_ID`);
    }

    return installationId;
  }
};
