import Pusher from 'pusher';
import { env } from './env.config';

const createPusher = (): Pusher => {
  if (!globalThis.__PUSHER__) {
    globalThis.__PUSHER__ = new Pusher({
      appId: env.PUSHER_APP_ID,
      key: env.PUSHER_KEY,
      secret: env.PUSHER_SECRET,
      cluster: 'mt1'
    });
  }
  return globalThis.__PUSHER__;
};

export const pusher = createPusher();
