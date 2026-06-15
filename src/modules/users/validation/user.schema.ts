import { z } from 'zod';

const loginRegex = /^[a-zA-Z0-9_-]*$/;
const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export const userInputSchema = z.object({
  login: z
    .string()
    .trim()
    .min(3, 'Login must be at least 3 characters')
    .max(10, 'Login must be at most 10 characters')
    .regex(loginRegex, 'Login has invalid format'),

  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(20, 'Password must be at most 20 characters'),

  email: z
    .string()
    .trim()
    .regex(emailRegex, 'Email has invalid format'),
});