"use strict";
// src/modules/guarantors/guarantor.service.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../../config/prisma"));
const AppError_1 = require("../../utils/AppError");
const guarantor_respository_1 = __importDefault(require("./guarantor.respository"));
class GuarantorService {
    async getAll(customerId) {
        return guarantor_respository_1.default.findAll(customerId);
    }
    async getById(id) {
        const guarantor = await guarantor_respository_1.default.findById(id);
        if (!guarantor) {
            throw new AppError_1.AppError(404, "Guarantor not found");
        }
        return guarantor;
    }
    async create(data) {
        const customer = await prisma_1.default.customer.findFirst({
            where: { id: data.customerId, deletedAt: null },
        });
        if (!customer) {
            throw new AppError_1.AppError(404, "Customer not found");
        }
        return guarantor_respository_1.default.create(data);
    }
    async update(id, data) {
        await this.getById(id);
        return guarantor_respository_1.default.update(id, data);
    }
    async delete(id) {
        await this.getById(id);
        return guarantor_respository_1.default.delete(id);
    }
}
exports.default = new GuarantorService();
