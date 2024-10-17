import { z } from 'zod';

export const updateScoreSchema = z
  .object({
    speed: z.number(),
    accuracy: z.number(),
    progress: z.number(),
    duration: z.number(),
    topSpeed: z.number()
  })
  .refine(({ speed, topSpeed }) => {
    return !(topSpeed < speed);
  }, "Top speed can't be less than average speed");

export const postRaceResultSchema = z.object({
  speed: z.number(),
  topSpeed: z.number(),
  accuracy: z.number()
});
