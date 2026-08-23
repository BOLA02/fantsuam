"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailProvider = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
class MailProvider {
    transporter = nodemailer_1.default.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
    async send(to, subject, html) {
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
        }
        catch (err) {
            return { success: false, error: err.message || 'Network error contacting mail provider' };
        }
    }
}
exports.MailProvider = MailProvider;
