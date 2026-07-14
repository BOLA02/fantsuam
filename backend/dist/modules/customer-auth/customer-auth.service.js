"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../../config/prisma"));
const AppError_1 = require("../../utils/AppError");
const password_1 = require("../../utils/password");
const jwt_1 = require("../../utils/jwt");
const customerSelect = {
    id: true,
    customerNumber: true,
    firstName: true,
    lastName: true,
    email: true,
};
class CustomerAuthService {
    async signup(email, password) {
        const customer = await prisma_1.default.customer.findFirst({
            where: { email, deletedAt: null, status: "ACTIVE" },
        });
        if (!customer) {
            throw new AppError_1.AppError(404, "No active loan application matches this email. Apply for a loan first.");
        }
        if (customer.passwordHash) {
            throw new AppError_1.AppError(409, "An account already exists for this email. Please sign in.");
        }
        const account = await prisma_1.default.customer.update({
            where: { id: customer.id },
            data: { passwordHash: await (0, password_1.hashPassword)(password) },
            select: customerSelect,
        });
        return this.session(account);
    }
    async login(email, password) {
        const customer = await prisma_1.default.customer.findFirst({
            where: { email, deletedAt: null, status: "ACTIVE" },
        });
        if (!customer?.passwordHash || !(await (0, password_1.comparePassword)(password, customer.passwordHash))) {
            throw new AppError_1.AppError(401, "Invalid email or password");
        }
        const account = await prisma_1.default.customer.findUniqueOrThrow({
            where: { id: customer.id }, select: customerSelect,
        });
        return this.session(account);
    }
    async me(customerId) {
        return prisma_1.default.customer.findUniqueOrThrow({ where: { id: customerId }, select: customerSelect });
    }
    session(customer) {
        return {
            token: (0, jwt_1.generateToken)({ id: customer.id, email: customer.email, role: "CUSTOMER" }),
            customer,
        };
    }
}
exports.default = new CustomerAuthService();
