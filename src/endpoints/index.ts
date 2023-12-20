import { ExpressReceiver } from '@slack/bolt';
import { Request, Response } from 'express-serve-static-core';

export const registerRootEndpoint = (expressReceiver: ExpressReceiver) => {
  expressReceiver.router.get('/', async (_req: Request, res: Response) => {
    return res.redirect('/slack/install');
  });
};
