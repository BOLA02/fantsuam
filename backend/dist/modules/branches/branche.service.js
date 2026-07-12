"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const branche_repository_1 = __importDefault(require("../branches/branche.repository"));
const AppError_1 = require("../../utils/AppError");
class BranchService {
    async getAll() {
        return branche_repository_1.default.findAll();
    }
    async getById(id) {
        const branch = await branche_repository_1.default.findById(id);
        if (!branch) {
            throw new AppError_1.AppError(404, "Branch not found");
        }
        return branch;
    }
    async create(data) {
        const existingBranch = await branche_repository_1.default.findByCode(data.branchCode);
        if (existingBranch) {
            throw new AppError_1.AppError(409, "Branch code already exists");
        }
        return branche_repository_1.default.create(data);
    }
    async update(id, data) {
        await this.getById(id);
        return branche_repository_1.default.update(id, data);
    }
    async delete(id) {
        await this.getById(id);
        const users = await branche_repository_1.default.countUsers(id);
        if (users > 0) {
            throw new AppError_1.AppError(400, "Cannot delete a branch with assigned staff");
        }
        return branche_repository_1.default.softDelete(id);
    }
}
exports.default = new BranchService();
