"use strict";
// src/modules/customers/customer.service.ts
// FULL FILE — UPDATED: added getByPhone() for the OTP flow
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const customer_repository_1 = __importDefault(require("./customer.repository"));
const branche_repository_1 = __importDefault(require("../branches/branche.repository"));
const AppError_1 = require("../../utils/AppError");
class CustomerService {
    async getAll() {
        return customer_repository_1.default.findAll();
    }
    async getById(id) {
        const customer = await customer_repository_1.default.findById(id);
        if (!customer) {
            throw new AppError_1.AppError(404, "Customer not found");
        }
        return customer;
    }
    // Used by the OTP resume flow. Returns null instead of throwing —
    // callers decide whether a "not found" phone should be silent or an error.
    async getByPhone(phone) {
        return customer_repository_1.default.findByPhone(phone);
    }
    async create(data) {
        const existingCustomer = await customer_repository_1.default.findByCustomerNumber(data.customerNumber);
        if (existingCustomer) {
            throw new AppError_1.AppError(409, "Customer number already exists");
        }
        const existingPhone = await customer_repository_1.default.findByPhone(data.phone);
        if (existingPhone) {
            throw new AppError_1.AppError(409, "Phone number already exists");
        }
        if (data.email) {
            const existingEmail = await customer_repository_1.default.findByEmail(data.email);
            if (existingEmail) {
                throw new AppError_1.AppError(409, "Email already exists");
            }
        }
        if (data.branchId) {
            const branch = await branche_repository_1.default.findById(data.branchId);
            if (!branch) {
                throw new AppError_1.AppError(404, "Branch not found");
            }
        }
        return customer_repository_1.default.create({
            ...data,
            dateOfBirth: new Date(data.dateOfBirth),
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
        return customer_repository_1.default.update(id, data);
    }
    async search(keyword) {
        return customer_repository_1.default.search(keyword);
    }
    async delete(id) {
        await this.getById(id);
        return customer_repository_1.default.softDelete(id);
    }
}
exports.default = new CustomerService();
