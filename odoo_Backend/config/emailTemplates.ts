import { EmailTemplate } from '../types/config.type.js';

export const EMAIL_TEMPLATES = {
  WELCOME: (name: string): EmailTemplate => ({
    subject: 'Welcome to our platform!',
    html: `<h1>Hello ${name}</h1><p>Welcome! We are excited to have you on board.</p>`,
    text: `Hello ${name},\n\nWelcome! We are excited to have you on board.`,
  }),
  RESET_PASSWORD: (resetUrl: string): EmailTemplate => ({
    subject: 'Reset your password',
    html: `<p>You requested a password reset. Click <a href="${resetUrl}">here</a> to reset it.</p>`,
    text: `You requested a password reset. Please go to the following link: ${resetUrl}`,
  }),

  OTP_EMAIL: (otp: string, expiresInMinutes: number = 10): EmailTemplate => ({
    subject: 'Your Password Reset OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #333;">Password Reset OTP</h2>
        <p style="color: #555;">You requested to reset your password. Use the OTP below:</p>
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #2563eb; text-align: center; padding: 16px 0;">
          ${otp}
        </div>
        <p style="color: #888; font-size: 13px;">This OTP expires in <strong>${expiresInMinutes} minutes</strong>. Do not share it with anyone.</p>
        <p style="color: #888; font-size: 13px;">If you did not request this, please ignore this email.</p>
      </div>
    `,
    text: `Your password reset OTP is: ${otp}\nIt expires in ${expiresInMinutes} minutes. Do not share it with anyone.`,
  }),

};
export type EmailTemplates = typeof EMAIL_TEMPLATES;
