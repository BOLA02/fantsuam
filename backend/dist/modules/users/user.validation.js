"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = exports.resetPasswordSchema = exports.updateUserSchema = exports.createUserSchema = void 0;
const zod_1 = require("zod");
exports.createUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        employeeNumber: zod_1.z.string().min(3),
        firstName: zod_1.z.string().min(2),
        lastName: zod_1.z.string().min(2),
        email: zod_1.z.string().email(),
        phone: zod_1.z.string().min(10).optional(),
        password: zod_1.z.string().min(8),
        role: zod_1.z.enum([
            "SUPER_ADMIN",
            "MANAGER",
            "LOAN_OFFICER",
            "CASHIER",
        ]),
        branchId: zod_1.z.string().uuid(),
    }),
});
exports.updateUserSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid(),
    }),
    body: zod_1.z.object({
        firstName: zod_1.z.string().min(2).optional(),
        lastName: zod_1.z.string().min(2).optional(),
        email: zod_1.z.string().email().optional(),
        phone: zod_1.z.string().min(10).optional(),
        role: zod_1.z
            .enum([
            "SUPER_ADMIN",
            "MANAGER",
            "LOAN_OFFICER",
            "CASHIER",
        ])
            .optional(),
        branchId: zod_1.z.string().uuid().optional(),
        status: zod_1.z
            .enum(["ACTIVE", "INACTIVE"])
            .optional(),
    }),
});
exports.resetPasswordSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid(),
    }),
    body: zod_1.z.object({
        password: zod_1.z.string().min(8),
    }),
});
exports.changePasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        currentPassword: zod_1.z.string(),
        newPassword: zod_1.z.string().min(8),
    }),
});
