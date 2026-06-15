import { z } from 'zod';

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
    .max(100, 'Website URL must be at most 100 characters')
    .url('Website URL must be valid URL')
    .refine((value) => value.startsWith('https://'), {
      message: 'Website URL must use HTTPS',
    }),
});