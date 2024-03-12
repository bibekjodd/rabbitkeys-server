import { z } from 'zod';

export const updateScoreSchema = z.object({
  speed: z.number(),
  progress: z.number(),
  duration: z.number()
});

export const getRacesDataSchema = z.object({
  cursor: z
    .string()
    .datetime({ offset: true })
    .optional()
    .transform((value) => value || new Date().toISOString()),
  limit: z
    .string()
    .optional()
    .transform((value) => {
      const limit = Number(value) || 10;
      if (limit < 1) return 10;
      if (limit > 20) return 20;
      return limit;
    })
});
