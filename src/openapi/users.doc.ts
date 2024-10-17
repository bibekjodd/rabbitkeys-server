import { queryUsersSchema, updateProfileSchema } from '@/dtos/users.dto';
import { responseUserSchema } from '@/schemas/users.schema';
import { z } from 'zod';
import { ZodOpenApiPathsObject } from 'zod-openapi';

const tags = ['User'];
export const usersDoc: ZodOpenApiPathsObject = {
  '/api/users/profile': {
    get: {
      summary: 'Fetch user profile',
      tags,
      responses: {
        200: {
          description: 'Profile fetched successfully',
          content: {
            'application/json': {
              schema: z.object({ user: responseUserSchema })
            }
          }
        },
        401: { description: 'User is not authorized' }
      }
    },
    put: {
      summary: 'Update profile',
      tags,
      requestBody: {
        content: { 'application/json': { schema: updateProfileSchema } }
      },
      responses: {
        200: {
          description: 'Profile updated successfully',
          content: {
            'application/json': {
              schema: z.object({ user: responseUserSchema })
            }
          }
        },
        400: { description: 'Invalid request body' },
        401: { description: 'User is not authorized' }
      }
    }
  },
  '/api/users/{id}': {
    get: {
      summary: 'Fetch user details by id',
      tags,
      requestParams: {
        path: z.object({ id: z.string() })
      },
      responses: {
        200: {
          description: 'User details fetched successfully',
          content: {
            'application/json': {
              schema: z.object({ user: responseUserSchema })
            }
          }
        },
        404: { description: 'User does not exist' }
      }
    }
  },
  '/api/users': {
    get: {
      summary: 'Fetch users list',
      tags,
      requestParams: {
        query: queryUsersSchema
      },
      responses: {
        200: {
          description: 'Users list fetched successfully',
          content: {
            'application/json': {
              schema: z.object({ users: z.array(responseUserSchema) })
            }
          }
        },
        400: { description: 'Invalid request query' }
      }
    }
  }
};
