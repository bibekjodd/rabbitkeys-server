import z from 'zod';

const imageRegExp = new RegExp(`(https?://.*.(png|gif|webp|jpeg|jpg))`);
export const imageSchema = z
  .string({ invalid_type_error: 'Invalid image url' })
  .trim()
  .regex(imageRegExp, 'invalid image url')
  .max(200, 'Too long image uri');

export const updateProfileSchema = z
  .object({
    name: z
      .string()
      .min(4, 'Too short name')
      .max(40, 'Too long name')
      .trim()
      .transform((value) => value.split(' ').slice(0, 3).join(' ')),
    image: imageSchema,
    carImage: imageSchema
  })
  .partial()
  .refine((value) => {
    return Object.keys(value).length > 0;
  }, 'Please provide at least one property to update');
