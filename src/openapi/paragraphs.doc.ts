import { responseParagraphSchema } from '@/schemas/paragraphs.schema';
import { z } from 'zod';
import { ZodOpenApiPathsObject } from 'zod-openapi';

const tags = ['Paragraph'];
export const paragraphsDoc: ZodOpenApiPathsObject = {
  '/api/paragraphs/random': {
    get: {
      tags,
      summary: 'Generate random paragraph',
      requestParams: {
        query: z.object({
          skip: z.string().optional().openapi({ description: 'Paragraph to skip from random' })
        })
      },
      responses: {
        200: {
          description: 'Random paragraph generated successfully',
          content: {
            'application/json': {
              schema: z.object({ paragraph: responseParagraphSchema })
            }
          }
        }
      }
    }
  },
  '/api/paragraphs/{id}': {
    get: {
      tags,
      summary: 'Get paragraph by id',
      responses: {
        200: {
          description: 'Paragraph fetched successfully',
          content: {
            'application/json': {
              schema: z.object({ paragraph: responseParagraphSchema })
            }
          }
        },
        404: { description: 'Paragraph does not exist' }
      }
    }
  }
};
