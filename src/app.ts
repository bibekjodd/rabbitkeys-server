import 'colors';
import cookieSession from 'cookie-session';
import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import passport from 'passport';
import { env, validateEnv } from './config/env.config';
import { NotFoundException } from './lib/exceptions';
import { devConsole, sessionOptions } from './lib/utils';
import { handleAsync } from './middlewares/handle-async';
import { handleErrorRequest } from './middlewares/handle-error-request';
import { handleSessionRegenerate } from './middlewares/handle-session-regenerate';
import { GoogleStrategy } from './passport/google.strategy';
import { serializer } from './passport/serializer';
import { authRoute } from './routes/auth.route';
import { paragraphRoute } from './routes/paragraph.route';
import { playerRoute } from './routes/player.route';
import { raceRoute } from './routes/race.route';
import { resultRoute } from './routes/result.route';
import { statsRoute } from './routes/stats.route';
import { trackRoute } from './routes/track.route';
import { userRoute } from './routes/user.route';

const app = express();
validateEnv();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ credentials: true, origin: env.FRONTEND_URLS }));
app.enable('trust proxy');
app.use(cookieSession(sessionOptions));
app.use(handleSessionRegenerate);
if (env.NODE_ENV === 'development') {
  app.use(morgan('common'));
}

app.use(passport.initialize());
app.use(passport.session());
passport.use('google', GoogleStrategy);
serializer();

app.get(
  '/',
  handleAsync(async (req, res) => {
    return res.json({
      message: 'Api is running fine...',
      env: env.NODE_ENV,
      date: new Date().toISOString()
    });
  })
);

/* --------- routes --------- */
app.use('/api/auth', authRoute);
app.use('/api/users', userRoute);
app.use('/api/players', playerRoute);
app.use('/api/tracks', trackRoute);
app.use('/api/races', raceRoute);
app.use('/api/paragraphs', paragraphRoute);
app.use('/api/results', resultRoute);
app.use('/api/stats', statsRoute);
app.use(() => {
  throw new NotFoundException();
});
app.use(handleErrorRequest);

if (env.NODE_ENV !== 'test') {
  app.listen(env.PORT, () => {
    devConsole(`⚡[Server]: listening at http://localhost:${env.PORT}`.yellow);
  });
}
export default app;
