// src/modules/otp/otp.repository.ts
// NEW FILE

import prisma from "../../config/prisma";

interface CreateOtpInput {
  phone: string;
  codeHash: string;
  purpose: string;
  expiresAt: Date;
}

class OtpRepository {
  async create(data: CreateOtpInput) {
    return prisma.otpCode.create({ data });
  }

  async findLatestActive(phone: string, purpose: string) {
    return prisma.otpCode.findFirst({
      where: { phone, purpose, consumedAt: null },
      orderBy: { createdAt: "desc" },
    });
  }

  async findLatest(phone: string, purpose: string) {
    return prisma.otpCode.findFirst({
      where: { phone, purpose },
      orderBy: { createdAt: "desc" },
    });
  }

  async incrementAttempts(id: string) {
    return prisma.otpCode.update({
      where: { id },
      data: { attempts: { increment: 1 } },
    });
  }

  async markConsumed(id: string) {
    return prisma.otpCode.update({
      where: { id },
      data: { consumedAt: new Date() },
    });
  }

  async invalidateActive(phone: string, purpose: string) {
    return prisma.otpCode.updateMany({
      where: { phone, purpose, consumedAt: null },
      data: { consumedAt: new Date() },
    });
  }
}

export default new OtpRepository();