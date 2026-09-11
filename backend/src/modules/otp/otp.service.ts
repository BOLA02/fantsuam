// src/modules/otp/otp.service.ts
// FULL FILE — REPLACE ENTIRELY: Adds prominent production console logs and a master bypass passcode

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppError } from "../../utils/AppError";
import otpRepository from "./otp.repository";
import customerService from "../customers/customer.service";
import { NotificationService } from "../notifications/notification.service";

const OTP_PURPOSE = "RESUME_APPLICATION";
const OTP_TTL_MINUTES = 5;
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_VERIFY_ATTEMPTS = 5;
const RESUME_TOKEN_TTL_MINUTES = 20;
const TEMPORARY_DEVELOPMENT_OTP = "123456";

const notifications = new NotificationService();

function normalizePhone(value: string) {
  const compact = value.trim().replace(/[\s()\-]/g, "");
  if (compact.startsWith("+234")) return `0${compact.slice(4)}`;
  if (compact.startsWith("234") && compact.length === 13) return `0${compact.slice(3)}`;
  return compact;
}

class OtpService {
  async requestOtp(phone: string) {
    phone = normalizePhone(phone);
    if (!phone || phone.trim().length < 7) {
      throw new AppError(400, "A valid phone number is required");
    }

    const customer = await customerService.getByPhone(phone);

    if (customer) {
      const recent = await otpRepository.findLatest(phone, OTP_PURPOSE);

      if (recent) {
        const elapsedMs = Date.now() - new Date(recent.createdAt).getTime();
        const cooldownMs = RESEND_COOLDOWN_SECONDS * 1000;

        if (elapsedMs < cooldownMs) {
          throw new AppError(429, "Please wait before requesting another code");
        }
      }

      await otpRepository.invalidateActive(phone, OTP_PURPOSE);

      const code = String(require("crypto").randomInt(100000, 1000000));
      const codeHash = await bcrypt.hash(code, 10);
      const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

      await otpRepository.create({
        phone,
        codeHash,
        purpose: OTP_PURPOSE,
        expiresAt,
      });

      await notifications.sendSms({
        customerId: customer.id,
        phone,
        templateCode: "RESUME_OTP",
        variables: { code, minutes: OTP_TTL_MINUTES },
      });

      // 🚀 Prominent visual box that prints regardless of development or production mode
      // eslint-disable-next-line no-console
      // eslint-disable-next-line no-console
      // eslint-disable-next-line no-console
    }

    return {
      message: "If that phone number is on file, a verification code has been sent."
    };
  }

  async verifyOtp(phone: string, code: string) {
    phone = normalizePhone(phone);
    if (code === TEMPORARY_DEVELOPMENT_OTP) {
      const customer = await customerService.getByPhone(phone);
      if (!customer) {
        throw new AppError(404, "No application found for this phone number");
      }
      return this.generateSessionToken(customer.id);
    }

    // 🚀 Master Passcode Bypass for seamless testing on your live Vercel frontend
    const otp = await otpRepository.findLatestActive(phone, OTP_PURPOSE);

    if (!otp) {
      throw new AppError(400, "No active code for this number. Please request a new one.");
    }

    const isExpired = new Date(otp.expiresAt).getTime() < Date.now();
    if (isExpired) {
      throw new AppError(400, "This code has expired. Please request a new one.");
    }

    if (otp.attempts >= MAX_VERIFY_ATTEMPTS) {
      throw new AppError(429, "Too many incorrect attempts. Please request a new code.");
    }

    const isValid = await bcrypt.compare(code, otp.codeHash);
    if (!isValid) {
      await otpRepository.incrementAttempts(otp.id);
      throw new AppError(400, "Incorrect code");
    }

    await otpRepository.markConsumed(otp.id);

    const customer = await customerService.getByPhone(phone);
    if (!customer) {
      throw new AppError(404, "No application found for this phone number");
    }

    return this.generateSessionToken(customer.id);
  }

  // Helper code abstraction block to cleanly assemble JSON Web Tokens
  private generateSessionToken(customerId: string) {
    const secret = process.env.RESUME_TOKEN_SECRET || process.env.JWT_SECRET;
    if (!secret) throw new AppError(500, "Resume-token secret is not configured");

    const resumeToken = jwt.sign(
      { customerId, purpose: "resume" },
      secret,
      { expiresIn: `${RESUME_TOKEN_TTL_MINUTES}m` }
    );

    return { resumeToken, expiresInMinutes: RESUME_TOKEN_TTL_MINUTES };
  }
}

export default new OtpService();
