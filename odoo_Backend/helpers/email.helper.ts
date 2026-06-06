import nodemailer from 'nodemailer';
import { config } from '../config/environment.js';
import { Logger } from './logger.helper.js';

export interface MailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{ filename: string; content: Buffer; contentType: string }>;
}

export class EmailHelper {
  private static getTransporter() {
    return nodemailer.createTransport({
      host: config.SMTP_HOST || 'smtp.ethereal.email',
      port: config.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: config.SMTP_USER,
        pass: config.SMTP_PASS,
      },
    });
  }

  public static init(): void {
    Logger.info('Email Transporter Initialized');
  }

  public static async sendMail(options: MailOptions): Promise<boolean> {
    try {
      const isSmtpConfigured =
        config.SMTP_HOST &&
        config.SMTP_USER &&
        config.SMTP_USER !== 'dev_smtp_username' &&
        config.SMTP_PASS &&
        config.SMTP_PASS !== 'dev_smtp_password';

      if (!isSmtpConfigured) {
        // Development mock — log to console so OTPs / reset links are visible
        Logger.warn(`[EMAIL MOCK] To: ${options.to} | Subject: ${options.subject}`);
        if (options.text) {
          Logger.warn(`[EMAIL MOCK] Body: ${options.text}`);
        }
        return true;
      }

      const transporter = EmailHelper.getTransporter();
      await transporter.sendMail({
        from: config.EMAIL_FROM || 'noreply@procurement.com',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: options.attachments,
      });

      Logger.info(`Email sent to ${options.to}`);
      return true;
    } catch (error) {
      Logger.error(`Failed to send email to ${options.to}: ${(error as Error).message}`);
      return false;
    }
  }
}
