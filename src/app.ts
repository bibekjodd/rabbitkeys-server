import 'colors';
import cookieSession from 'cookie-session';
import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import passport from 'passport';
import 'zod-openapi/extend';
import { env, validateEnv } from './config/env.config';
import { NotFoundException } from './lib/exceptions';
import { devConsole, sessionOptions } from './lib/utils';
import { handleErrorRequest } from './middlewares/handle-error-request';
import { handleSessionRegenerate } from './middlewares/handle-session-regenerate';
import { openApiSpecs, serveApiReference } from './openapi';
import { GoogleStrategy } from './passport/google.strategy';
import { serializer } from './passport/serializer';
import { authRoute } from './routes/auth.route';
import { paragraphsRoute } from './routes/paragraphs.route';
import { resultsRoute } from './routes/results.route';
import { statsRoute } from './routes/stats.route';
import { tracksRoute } from './routes/tracks.route';
import { usersRoute } from './routes/users.route';

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

app.get('/', (req, res) => {
  res.json({
    message: 'Api is running fine...',
    env: env.NODE_ENV,
    date: new Date().toISOString()
  });
});

/* --------- routes --------- */
app.use('/api/auth', authRoute);
app.use('/api/users', usersRoute);
app.use('/api/tracks', tracksRoute);
app.use('/api/paragraphs', paragraphsRoute);
app.use('/api/results', resultsRoute);
app.use('/api/stats', statsRoute);
app.get('/doc', (req, res) => {
  res.json(openApiSpecs);
});
app.get('/reference', serveApiReference);
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
