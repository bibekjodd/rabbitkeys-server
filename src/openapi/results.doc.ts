import { postRaceResultSchema } from '@/dtos/races.dto';
import { getPreviousResultsSchema } from '@/dtos/results.dto';
import { responseRaceSchema } from '@/schemas/races.schema';
import { z } from 'zod';
import { ZodOpenApiPathsObject } from 'zod-openapi';

const tags = ['Result'];
export const resultsDoc: ZodOpenApiPathsObject = {
  '/api/results': {
    post: {
      tags,
      summary: 'Post race result to the server',
      requestBody: {
        content: {
          'application/json': {
            schema: postRaceResultSchema
          }
        }
      },
      responses: {
        201: {
          description: 'Result posted to the server',
          content: {
            'application/json': {
              schema: z.object({ result: responseRaceSchema })
            }
          }
        },
        401: { description: 'User is not authorized' }
      }
    },
    get: {
      tags,
      summary: 'Get previous races results',
      requestParams: { query: getPreviousResultsSchema },
      responses: {
        200: {
          description: 'Result posted to the server',
          content: {
            'application/json': {
              schema: z.object({ results: z.array(responseRaceSchema) })
            }
          }
        },
        400: { description: 'Invalid request query' },
        401: { description: 'User is not authorized' }
      }
    }
  }
};
