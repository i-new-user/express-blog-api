import { z } from 'zod';

export const registrationEmailResendingSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Email has invalid format'),
});