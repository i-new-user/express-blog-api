import { z } from 'zod';

export const loginInputSchema = z.object({
  loginOrEmail: z
    .string()
    .trim()
    .min(1, 'Login or email is required'),

  password: z
    .string()
    .min(1, 'Password is required'),
});