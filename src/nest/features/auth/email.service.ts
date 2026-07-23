import { Injectable } from '@nestjs/common';
import nodemailer, { Transporter } from 'nodemailer';
import { appConfig } from '../../config/app.config';

@Injectable()
export class EmailService {
  private readonly transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: appConfig.emailHost,
      port: appConfig.emailPort,
      secure: false,
      auth:
        appConfig.emailUser && appConfig.emailPassword
          ? {
              user: appConfig.emailUser,
              pass: appConfig.emailPassword,
            }
          : undefined,
    });
  }

  async sendRegistrationEmail(
    email: string,
    confirmationCode: string,
  ): Promise<boolean> {
    const confirmationLink =
      `${appConfig.clientUrl}/confirm-registration?code=${confirmationCode}`;

    return this.sendEmail(
      email,
      'Registration confirmation',
      `
        <h1>Thank you for your registration</h1>
        <p>To finish registration please follow the link below:</p>
        <a href="${confirmationLink}">complete registration</a>
      `,
    );
  }

  async sendPasswordRecoveryEmail(
    email: string,
    recoveryCode: string,
  ): Promise<boolean> {
    const recoveryLink =
      `${appConfig.clientUrl}/password-recovery?recoveryCode=${recoveryCode}`;

    return this.sendEmail(
      email,
      'Password recovery',
      `
        <h1>Password recovery</h1>
        <p>To finish password recovery please follow the link below:</p>
        <a href="${recoveryLink}">recovery password</a>
      `,
    );
  }

  private async sendEmail(
    email: string,
    subject: string,
    html: string,
  ): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: appConfig.emailFrom,
        to: email,
        subject,
        html,
      });

      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }
}
