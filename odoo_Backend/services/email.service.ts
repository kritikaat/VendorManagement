import { EmailHelper } from '../helpers/email.helper.js';
import { EMAIL_TEMPLATES } from '../config/emailTemplates.js';
import { Logger } from '../helpers/logger.helper.js';

export class EmailService {
  /**
   * Sends the welcome email to a new user
   */
  public static async sendWelcomeEmail(email: string, firstName: string): Promise<boolean> {
    try {
      const template = EMAIL_TEMPLATES.WELCOME(firstName);
      return await EmailHelper.sendMail({
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });
    } catch (error) {
      Logger.error(`Error sending welcome email: ${(error as Error).message}`);
      return false;
    }
  }

  /**
   * Sends password reset email
   */
  public static async sendPasswordResetEmail(email: string, resetUrl: string): Promise<boolean> {
    try {
      const template = EMAIL_TEMPLATES.RESET_PASSWORD(resetUrl);
      return await EmailHelper.sendMail({
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });
    } catch (error) {
      Logger.error(`Error sending password reset email: ${(error as Error).message}`);
      return false;
    }
  }
}
