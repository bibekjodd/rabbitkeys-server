import { env } from '@/config/env.config';
import { CookieOptions, SessionOptions } from 'express-session';
import MongoStore from 'connect-mongo';

export const devConsole = (...args: string[]) => {
  if (env.NODE_ENV !== 'production') {
    console.log(args.join(' '));
  }
};

export const cookieOptions: CookieOptions = {
  maxAge: Date.now() + 30 * 24 * 60 * 60 * 1000,
  httpOnly: true,
  secure: env.NODE_ENV !== 'production' ? false : true,
  sameSite: env.NODE_ENV !== 'production' ? 'lax' : 'none'
};

export const sessionOptions: SessionOptions = {
  resave: false,
  saveUninitialized: false,
  secret: env.SESSION_SECRET,
  proxy: true,
  cookie: cookieOptions,
  store: new MongoStore({ mongoUrl: env.MONGO_URI })
};
