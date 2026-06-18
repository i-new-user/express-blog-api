import { z } from 'zod';

export const passwordRecoverySchema = z.object({
  email: z.string().trim().toLowerCase().email('Email has invalid format'),
});

export const newPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(20, 'Password must be at most 20 characters'),

  recoveryCode: z.string().trim().min(1, 'Recovery code is required'),
});