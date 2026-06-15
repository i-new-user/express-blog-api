import nodemailer from 'nodemailer';
import { env } from '../../../config/env';

const transporter = nodemailer.createTransport({
  host: env.EMAIL_HOST,
  port: Number(env.EMAIL_PORT),
  secure: false,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASSWORD,
  },
});

export const emailManager = {
  async sendRegistrationEmail(
    email: string,
    code: string,
  ): Promise<void> {
    try {
      const confirmationUrl =
        `${env.clientUrl}/confirm-email?code=${code}`;

      await Promise.race([
        transporter.sendMail({
          from: env.EMAIL_FROM,
          to: email,
          subject: 'register',
          html: `
            <h1>Thank for your registration</h1>
            <p>
              To finish registration please follow the link below:
              <a href='${confirmationUrl}'>
                complete registration
              </a>
            </p>
          `,
        }),

        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('email timeout')), 4000),
        ),
      ]);

      console.log('EMAIL SENT');
    } catch (error) {
      console.error('EMAIL ERROR:', error);
    }
  },
};