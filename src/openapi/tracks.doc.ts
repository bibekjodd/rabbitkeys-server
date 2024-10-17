import { responseTrackSchema } from '@/schemas/tracks.schema';
import { z } from 'zod';
import { ZodOpenApiPathsObject } from 'zod-openapi';

const tags = ['Track'];
export const tracksDoc: ZodOpenApiPathsObject = {
  '/api/tracks': {
    post: {
      summary: 'Create a track',
      tags,
      responses: {
        201: {
          description: 'New track created successfully',
          content: {
            'application/json': {
              schema: z.object({ track: responseTrackSchema })
            }
          }
        },
        401: { description: 'User is not authorized' }
      }
    }
  },
  '/api/tracks/{id}': {
    get: {
      tags,
      summary: 'Join/get current state of the track',
      requestParams: { path: z.object({ id: z.string() }) },
      responses: {
        200: {
          description: 'Joined/fetched track successfully',
          content: {
            'application/json': {
              schema: z.object({ track: responseTrackSchema })
            }
          }
        },
        400: { description: 'Track or player was inactive' },
        401: { description: 'User is not authorized' },
        404: { description: 'Track does not exist' }
      }
    }
  },
  '/api/tracks/{id}/leave': {
    put: {
      tags,
      summary: 'Leave the current track',
      requestParams: {
        path: z.object({ id: z.string() })
      },
      responses: {
        200: { description: 'Left track successfully' },
        401: { description: 'User is not authorized' },
        404: { description: 'Track does not exist' }
      }
    }
  },
  '/api/tracks/{trackId}/invite/{playerId}': {
    put: {
      tags,
      summary: 'Invite player to the track',
      requestParams: {
        path: z.object({ playerId: z.string(), trackId: z.string() })
      },
      responses: {
        200: { description: 'Player invited successfully' },
        400: {
          description:
            'User has not joined the track to invite or track is already full or track has pending race'
        },
        401: { description: 'User is not authorized' },
        404: { description: 'Track or user does not exist' }
      }
    }
  },
  '/api/tracks/{trackId}/kick/{playerId}': {
    put: {
      tags,
      summary: 'Kick player from the track',
      requestParams: {
        path: z.object({ playerId: z.string(), trackId: z.string() })
      },
      responses: {
        200: { description: 'Player kicked successfully' },
        400: {
          description: 'User has not joined the track or track has pending race'
        },
        401: { description: 'User is not authorized' },
        403: { description: 'User is not the host of the track' },
        404: { description: 'Track or user does not exist' }
      }
    }
  },

  '/api/tracks/{id}/start-race': {
    put: {
      tags,
      summary: 'Start race',
      requestParams: {
        path: z.object({ id: z.string() })
      },
      responses: {
        200: {
          description: 'Race started successfully',
          content: {
            'application/json': {
              schema: z.object({ track: responseTrackSchema })
            }
          }
        },
        400: {
          description:
            'Race is already started or track is dismissed due to inactivity or track does not have minimum required players'
        },
        401: { description: 'User is not authorized' },
        403: { description: 'User is not the host of the track' },
        404: { description: 'Track does not exist' }
      }
    }
  },
  '/api/tracks/{id}/score': {
    put: {
      tags,
      summary: 'Update score',
      requestParams: {
        path: z.object({ id: z.string() })
      },
      responses: {
        200: { description: 'Score updated successfully' },
        400: {
          description: 'Request body is invalid or track is dismissed due to inactivty'
        },
        401: { description: 'User is not authorized' },
        403: {
          description: 'Scores can be updated only after the race has begun'
        },
        404: { description: 'Track does not exist' }
      }
    }
  }
};
