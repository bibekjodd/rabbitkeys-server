import { EnvType } from '@/config/env.config';
import { User as TUser } from './schemas/user.schema';
import Pusher from 'pusher';

export {};
declare global {
  namespace NodeJS {
    interface ProcessEnv extends EnvType {
      //
    }
  }
  namespace Express {
    interface User extends TUser {}
    interface Request {
      user: TUser;
    }
  }

  var __PUSHER__: Pusher | undefined;
}
