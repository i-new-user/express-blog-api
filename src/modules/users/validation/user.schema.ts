import { z } from 'zod';

const loginRegex = /^[a-zA-Z0-9_-]+$/;

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
    .toLowerCase()
    .email('Email has invalid format'),
});