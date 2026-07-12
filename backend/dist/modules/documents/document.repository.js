"use strict";
// src/modules/documents/document.repository.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../../config/prisma"));
class DocumentRepository {
    async findAll(filters) {
        return prisma_1.default.document.findMany({
            where: {
                customerId: filters.customerId || undefined,
                guarantorId: filters.guarantorId || undefined,
                applicationId: filters.applicationId || undefined,
                collateralId: filters.collateralId || undefined,
                verificationStatus: filters.verificationStatus
                    ? filters.verificationStatus
                    : undefined,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }
    async findById(id) {
        return prisma_1.default.document.findUnique({
            where: { id },
            include: {
                customer: true,
                guarantor: true,
                application: true,
            },
        });
    }
    async create(data) {
        return prisma_1.default.document.create({
            data: data,
        });
    }
    async updateVerification(id, verificationStatus, remarks) {
        return prisma_1.default.document.update({
            where: { id },
            data: {
                verificationStatus,
                remarks,
            },
        });
    }
    async delete(id) {
        return prisma_1.default.document.delete({
            where: { id },
        });
    }
}
exports.default = new DocumentRepository();
