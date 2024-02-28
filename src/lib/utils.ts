import { env } from '@/config/env.config';
import { CookieOptions, SessionOptions } from 'express-session';
import MongoStore from 'connect-mongo';

export const devConsole = (...args: string[]) => {
  if (env.NODE_ENV !== 'production') {
    console.log(args.join(' '));
  }
};

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production' ? true : false,
  sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000
};

export const sessionOptions: SessionOptions = {
  resave: false,
  saveUninitialized: false,
  secret: env.SESSION_SECRET,
  proxy: true,
  cookie: cookieOptions,
  store: new MongoStore({ mongoUrl: env.MONGO_URI })
};
