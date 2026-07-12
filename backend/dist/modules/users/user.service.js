"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_repository_1 = __importDefault(require("./user.repository"));
const branche_repository_1 = __importDefault(require("../branches/branche.repository"));
const password_1 = require("../../utils/password");
const AppError_1 = require("../../utils/AppError");
class UserService {
    async getAll() {
        return user_repository_1.default.findAll();
    }
    async getById(id) {
        const user = await user_repository_1.default.findById(id);
        if (!user) {
            throw new AppError_1.AppError(404, "User not found");
        }
        return user;
    }
    async create(data) {
        const emailExists = await user_repository_1.default.findByEmail(data.email);
        if (emailExists) {
            throw new AppError_1.AppError(409, "Email already exists");
        }
        const employeeExists = await user_repository_1.default.findByEmployeeNumber(data.employeeNumber);
        if (employeeExists) {
            throw new AppError_1.AppError(409, "Employee number already exists");
        }
        const branch = await branche_repository_1.default.findById(data.branchId);
        if (!branch) {
            throw new AppError_1.AppError(404, "Branch not found");
        }
        const passwordHash = await (0, password_1.hashPassword)(data.password);
        delete data.password;
        return user_repository_1.default.create({
            ...data,
            passwordHash,
        });
    }
    async update(id, data) {
        await this.getById(id);
        if (data.branchId) {
            const branch = await branche_repository_1.default.findById(data.branchId);
            if (!branch) {
                throw new AppError_1.AppError(404, "Branch not found");
            }
        }
        return user_repository_1.default.update(id, data);
    }
    async resetPassword(id, password) {
        await this.getById(id);
        const passwordHash = await (0, password_1.hashPassword)(password);
        return user_repository_1.default.updatePassword(id, passwordHash);
    }
    async changePassword(id, currentPassword, newPassword) {
        const user = await this.getById(id);
        const valid = await (0, password_1.comparePassword)(currentPassword, user.passwordHash);
        if (!valid) {
            throw new AppError_1.AppError(400, "Current password is incorrect");
        }
        const passwordHash = await (0, password_1.hashPassword)(newPassword);
        return user_repository_1.default.updatePassword(id, passwordHash);
    }
    async changeStatus(id, status) {
        await this.getById(id);
        return user_repository_1.default.update(id, {
            status,
        });
    }
    async delete(id) {
        await this.getById(id);
        return user_repository_1.default.softDelete(id);
    }
}
exports.default = new UserService();
