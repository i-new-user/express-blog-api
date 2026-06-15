import { z } from 'zod';

const websiteUrlRegex =
  /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/;

export const blogInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(15, 'Name must be at most 15 characters'),

  description: z
    .string()
    .trim()
    .min(1, 'Description is required')
    .max(500, 'Description must be at most 500 characters'),

  websiteUrl: z
  .string()
  .trim()
  .min(1, 'Website URL is required')
  .refine(
    (value) => {
      if (!value) return true;

      return /^https:\/\/.+/i.test(value);
    },
    {
      message: 'Website URL must be valid HTTPS URL',
    },
  )
});

