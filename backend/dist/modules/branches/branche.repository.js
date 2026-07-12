"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../../config/prisma"));
class BranchRepository {
    async findAll() {
        return prisma_1.default.branch.findMany({
            where: {
                deletedAt: null,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }
    async findById(id) {
        return prisma_1.default.branch.findFirst({
            where: {
                id,
                deletedAt: null,
            },
        });
    }
    async findByCode(branchCode) {
        return prisma_1.default.branch.findUnique({
            where: {
                branchCode,
            },
        });
    }
    async create(data) {
        return prisma_1.default.branch.create({
            data,
        });
    }
    async update(id, data) {
        return prisma_1.default.branch.update({
            where: { id },
            data,
        });
    }
    async softDelete(id) {
        return prisma_1.default.branch.update({
            where: { id },
            data: {
                deletedAt: new Date(),
            },
        });
    }
    async countUsers(id) {
        return prisma_1.default.user.count({
            where: {
                branchId: id,
            },
        });
    }
}
exports.default = new BranchRepository();
