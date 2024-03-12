import { EnvType } from '@/config/env.config';
import Pusher from 'pusher';
import { UserSnapshot } from './schemas/user.schema';

export {};
declare global {
  namespace NodeJS {
    interface ProcessEnv extends EnvType {
      //
    }
  }
  namespace Express {
    interface User extends UserSnapshot {}
    interface Request {
      user: UserSnapshot;
    }
  }

  var __PUSHER__: Pusher | undefined;
}
