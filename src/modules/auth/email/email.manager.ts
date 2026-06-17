import nodemailer from 'nodemailer';
import { env } from '../../../config/env';

const transporter = nodemailer.createTransport({
  host: env.emailHost,
  port: env.emailPort,
  secure: false,
  auth:
    env.emailUser && env.emailPassword
      ? {
          user: env.emailUser,
          pass: env.emailPassword,
        }
      : undefined,
});

export const emailManager = {
  async sendEmail(
    email: string,
    subject: string,
    message: string,
  ): Promise<boolean> {
    try {
      await transporter.sendMail({
        from: env.emailFrom,
        to: email,
        subject,
        html: message,
      });

      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  },

  async sendRegistrationEmail(
    email: string,
    confirmationCode: string,
  ): Promise<boolean> {
    const confirmationLink = `${env.clientUrl}/confirm-registration?code=${confirmationCode}`;

    return this.sendEmail(
      email,
      'Registration confirmation',
      `
        <h1>Thank you for your registration</h1>
        <p>To finish registration please follow the link below:</p>
        <a href="${confirmationLink}">complete registration</a>
      `,
    );
  },

  async sendPasswordRecoveryEmail(
  email: string,
  recoveryCode: string,
): Promise<boolean> {
  const recoveryLink = `${env.clientUrl}/password-recovery?recoveryCode=${recoveryCode}`;

  return this.sendEmail(
    email,
    'Password recovery',
    `
      <h1>Password recovery</h1>
      <p>
        To finish password recovery please follow the link below:
        <a href="${recoveryLink}">recovery password</a>
      </p>
    `,
  );
},
};