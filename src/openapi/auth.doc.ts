import { ZodOpenApiPathsObject } from 'zod-openapi';

const tags = ['Auth'];
export const authDoc: ZodOpenApiPathsObject = {
  '/api/auth/login/google': {
    get: {
      tags,
      summary: 'Login with google',
      responses: { 302: { description: 'Redirection to google for login' } }
    }
  },
  '/api/auth/logout': {
    post: {
      tags,
      summary: 'Logout user',
      responses: {
        200: { description: 'Logged out successfully' },
        401: { description: 'User is not authorized' }
      }
    }
  }
};
