import { z } from 'zod';

export const updateScoreSchema = z.object({
  speed: z.number(),
  progress: z.number(),
  duration: z.number()
});
