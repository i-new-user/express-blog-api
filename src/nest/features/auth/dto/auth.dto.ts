import { z } from 'zod';

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('Email has invalid format');

const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .max(20, 'Password must be at most 20 characters');

export const loginSchema = z.object({
  loginOrEmail: z.string().trim().min(1, 'Login or email is required'),
  password: z.string().min(1, 'Password is required'),
});

export class LoginDto {
  loginOrEmail!: string;
  password!: string;
}

export const registrationSchema = z.object({
  login: z
    .string()
    .trim()
    .min(3, 'Login must be at least 3 characters')
    .max(10, 'Login must be at most 10 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Login has invalid format'),
  password: passwordSchema,
  email: emailSchema,
});

export class RegistrationDto {
  login!: string;
  password!: string;
  email!: string;
}

export const registrationConfirmationSchema = z.object({
  code: z.string().trim().min(1, 'Confirmation code is required'),
});

export class RegistrationConfirmationDto {
  code!: string;
}

export const registrationEmailResendingSchema = z.object({
  email: emailSchema,
});

export class RegistrationEmailResendingDto {
  email!: string;
}

export const passwordRecoverySchema = z.object({
  email: emailSchema,
});

export class PasswordRecoveryDto {
  email!: string;
}

export const newPasswordSchema = z.object({
  newPassword: passwordSchema,
  recoveryCode: z.string().trim().min(1, 'Recovery code is required'),
});

export class NewPasswordDto {
  newPassword!: string;
  recoveryCode!: string;
}
