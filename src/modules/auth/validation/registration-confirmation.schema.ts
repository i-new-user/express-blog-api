import { z } from 'zod';

export const registrationConfirmationSchema = z.object({
  code: z.string().trim().min(1),
});