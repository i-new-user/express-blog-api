import { z } from 'zod';

export const postInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(30, 'Title must be at most 30 characters'),

  shortDescription: z
    .string()
    .trim()
    .min(1, 'Short description is required')
    .max(100, 'Short description must be at most 100 characters'),

  content: z
    .string()
    .trim()
    .min(1, 'Content is required')
    .max(1000, 'Content must be at most 1000 characters'),

  blogId: z.string().trim().min(1, 'Blog id is required'),
});

export const blogPostInputSchema = postInputSchema.omit({
  blogId: true,
});