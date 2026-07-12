"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRepository = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
class AuthRepository {
    async findByEmail(email) {
        return prisma_1.default.user.findUnique({
            where: { email },
            include: {
                branch: true,
            },
        });
    }
    async updateLastLogin(id) {
        return prisma_1.default.user.update({
            where: { id },
            data: {
                lastLoginAt: new Date(),
            },
        });
    }
    async findById(id) {
        return prisma_1.default.user.findUnique({
            where: { id },
            include: {
                branch: true,
            },
        });
    }
}
exports.AuthRepository = AuthRepository;
exports.default = new AuthRepository();
