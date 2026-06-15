import { z } from 'zod';

export const registrationInputSchema = z.object({
  login: z
    .string()
    .trim()
    .min(3)
    .max(10)
    .regex(/^[a-zA-Z0-9_-]*$/),

  password: z.string().trim().min(6).max(20),

  email: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/),
});