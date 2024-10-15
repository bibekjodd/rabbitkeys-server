import { apiReference } from '@scalar/express-api-reference';
import packageJson from 'package.json' with { type: 'json' };
import { createDocument } from 'zod-openapi';
import { paragraphsDoc } from './paragraphs.doc';
import { resultsDoc } from './results.doc';
import { statsDoc } from './stats.doc';
import { tracksDoc } from './tracks.doc';
import { usersDoc } from './users.doc';
import { authDoc } from './auth.doc';

export const openApiSpecs = createDocument({
  info: {
    title: 'Rabbitkeys',
    version: packageJson.version,
    description: 'Online single/multiplayer typeracing game'
  },
  openapi: '3.1.0',
  paths: {
    '/': {
      get: {
        summary: 'Check server status',
        responses: {
          200: { description: 'Server is running fine' },
          500: { description: 'Internal server error' }
        }
      }
    },
    '/doc': {
      get: {
        summary: 'Get openapi doc',
        responses: {
          200: { description: 'Openapi specs doc fetched successfully' }
        }
      }
    },
    ...authDoc,
    ...usersDoc,
    ...tracksDoc,
    ...paragraphsDoc,
    ...resultsDoc,
    ...statsDoc
  }
});

export const serveApiReference = apiReference({
  spec: { content: openApiSpecs },
  theme: 'kepler',
  layout: 'modern',
  defaultHttpClient: { targetKey: 'javascript', clientKey: 'fetch' },
  darkMode: true
});
