"use strict";
// src/modules/otp/otp.repository.ts
// NEW FILE
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../../config/prisma"));
class OtpRepository {
    async create(data) {
        return prisma_1.default.otpCode.create({ data });
    }
    async findLatestActive(phone, purpose) {
        return prisma_1.default.otpCode.findFirst({
            where: { phone, purpose, consumedAt: null },
            orderBy: { createdAt: "desc" },
        });
    }
    async findLatest(phone, purpose) {
        return prisma_1.default.otpCode.findFirst({
            where: { phone, purpose },
            orderBy: { createdAt: "desc" },
        });
    }
    async incrementAttempts(id) {
        return prisma_1.default.otpCode.update({
            where: { id },
            data: { attempts: { increment: 1 } },
        });
    }
    async markConsumed(id) {
        return prisma_1.default.otpCode.update({
            where: { id },
            data: { consumedAt: new Date() },
        });
    }
    async invalidateActive(phone, purpose) {
        return prisma_1.default.otpCode.updateMany({
            where: { phone, purpose, consumedAt: null },
            data: { consumedAt: new Date() },
        });
    }
}
exports.default = new OtpRepository();
