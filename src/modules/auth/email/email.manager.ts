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
  async sendRegistrationEmail(email: string, code: string): Promise<void> {
   const confirmationUrl = `${env.clientUrl}/confirm-email?code=${code}`;

    await transporter.sendMail({
      from: env.EMAIL_FROM,
      to: email,
      subject: 'register',
      html: `
        <div>
          <h1>Thank for your registration</h1>
          <p>
            To finish registration please follow the link below:
            <a href='${confirmationUrl}'>complete registration</a>
          </p>
        </div>
      `,
    });
  },
};