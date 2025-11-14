import nodemailer from 'nodemailer';
import { env } from '../config/env';

const emailEnabled =
  env.NODE_ENV === 'production' &&
  env.SMTP_PASS.trim().toLowerCase() !== 'your-app-password';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: parseInt(env.SMTP_PORT),
  secure: false,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS
  }
});

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${token}`;

  if (!emailEnabled) {
    console.warn('[email] Verification email skipped (disabled in current environment)');
    console.info('[email] Verification URL:', verificationUrl);
    return;
  }

  await transporter.sendMail({
    from: '"WebChat.ai" <noreply@webchat.cz>',
    to: email,
    subject: 'Verify Your Email - WebChat.ai',
    html: `
      <h2>Welcome to WebChat.ai!</h2>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
      <p>This link will expire in 24 hours.</p>
    `
  });
}

export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<void> {
  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;

  if (!emailEnabled) {
    console.warn('[email] Password reset email skipped (disabled in current environment)');
    console.info('[email] Reset URL:', resetUrl);
    return;
  }

  await transporter.sendMail({
    from: '"WebChat.ai" <noreply@webchat.cz>',
    to: email,
    subject: 'Reset Your Password - WebChat.ai',
    html: `
      <h2>Password Reset Request</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `
  });
}
