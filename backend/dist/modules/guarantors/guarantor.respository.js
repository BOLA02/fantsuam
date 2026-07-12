"use strict";
// src/modules/guarantors/guarantor.repository.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../../config/prisma"));
class GuarantorRepository {
    async findAll(customerId) {
        return prisma_1.default.guarantor.findMany({
            where: {
                customerId: customerId || undefined,
            },
            include: {
                customer: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }
    async findById(id) {
        return prisma_1.default.guarantor.findUnique({
            where: { id },
            include: {
                customer: true,
                documents: true,
            },
        });
    }
    async create(data) {
        return prisma_1.default.guarantor.create({
            data,
            include: {
                customer: true,
            },
        });
    }
    async update(id, data) {
        return prisma_1.default.guarantor.update({
            where: { id },
            data,
            include: {
                customer: true,
            },
        });
    }
    async delete(id) {
        return prisma_1.default.guarantor.delete({
            where: { id },
        });
    }
    async countByCustomer(customerId) {
        return prisma_1.default.guarantor.count({
            where: { customerId },
        });
    }
}
exports.default = new GuarantorRepository();
