import { Logger, SlackAction, SlackViewAction, SlashCommand } from '@slack/bolt';

export const getInstallationId = (
  commandOrAction: SlashCommand | SlackAction | SlackViewAction,
  logger?: Logger,
) => {
  if ('command' in commandOrAction) {
    const enterpriseId = commandOrAction.enterprise_id;
    const teamId = commandOrAction.team_id;
    const installationId = enterpriseId ?? teamId;
    return installationId;
  } else {
    const enterpriseId = commandOrAction.enterprise?.id;
    const teamId = commandOrAction.team?.id;
    const installationId = enterpriseId ?? teamId;

    if (!installationId) {
      logger?.error(`Could not retrieve installation id.`, commandOrAction);
      throw Error(`ERR_UNKNOWN_INSTALLATION_ID`);
    }

    return installationId;
  }
};
