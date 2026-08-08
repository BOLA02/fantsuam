import nodemailer from 'nodemailer';

export interface SendResult {
  success: boolean;
  providerMessageId?: string;
  error?: string;
}

export class MailProvider {
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  async send(to: string, subject: string, html: string): Promise<SendResult> {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return { success: false, error: 'SMTP credentials not configured' };
    }

    try {
      const info = await this.transporter.sendMail({
        from: process.env.MAIL_FROM || process.env.SMTP_USER,
        to,
        subject,
        html,
      });
      return { success: true, providerMessageId: info.messageId };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error contacting mail provider' };
    }
  }
}
