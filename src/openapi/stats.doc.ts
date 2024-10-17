import { responseUserSchema } from '@/schemas/users.schema';
import { z } from 'zod';
import { ZodOpenApiPathsObject } from 'zod-openapi';

const tags = ['Stats'];
export const statsDoc: ZodOpenApiPathsObject = {
  '/api/stats/leaderboard': {
    get: {
      tags,
      summary: 'Get current leaderboard',
      responses: {
        200: {
          description: 'Leaderboard data fetched successfully',
          content: {
            'application/json': {
              schema: z.object({
                leaderboard: z.array(
                  z.object({
                    speed: z.number(),
                    accuracy: z.number(),
                    topSpeed: z.number(),
                    createdAt: z.string(),
                    user: responseUserSchema
                  })
                )
              })
            }
          }
        }
      }
    }
  }
};
