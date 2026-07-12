"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../../config/prisma"));
class UserRepository {
    async findAll() {
        return prisma_1.default.user.findMany({
            where: {
                deletedAt: null,
            },
            include: {
                branch: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }
    async findById(id) {
        return prisma_1.default.user.findFirst({
            where: {
                id,
                deletedAt: null,
            },
            include: {
                branch: true,
            },
        });
    }
    async findByEmail(email) {
        return prisma_1.default.user.findUnique({
            where: {
                email,
            },
        });
    }
    async findByEmployeeNumber(employeeNumber) {
        return prisma_1.default.user.findUnique({
            where: {
                employeeNumber,
            },
        });
    }
    async create(data) {
        return prisma_1.default.user.create({
            data,
            include: {
                branch: true,
            },
        });
    }
    async update(id, data) {
        return prisma_1.default.user.update({
            where: {
                id,
            },
            data,
            include: {
                branch: true,
            },
        });
    }
    async updatePassword(id, passwordHash) {
        return prisma_1.default.user.update({
            where: {
                id,
            },
            data: {
                passwordHash,
            },
        });
    }
    async softDelete(id) {
        return prisma_1.default.user.update({
            where: {
                id,
            },
            data: {
                deletedAt: new Date(),
            },
        });
    }
}
exports.default = new UserRepository();
