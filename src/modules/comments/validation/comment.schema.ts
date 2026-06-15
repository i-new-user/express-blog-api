import { z } from 'zod';

export const commentInputSchema = z.object({
  content: z
    .string()
    .trim()
    .min(20, 'Content must be at least 20 characters')
    .max(300, 'Content must be at most 300 characters'),
});