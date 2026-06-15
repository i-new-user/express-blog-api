import { z } from 'zod';

export const registrationEmailResendingSchema = z.object({
  email: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/),
});