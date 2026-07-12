"use strict";
// src/modules/guarantors/guarantor.validation.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.idParamSchema = exports.updateGuarantorSchema = exports.createGuarantorSchema = void 0;
const zod_1 = require("zod");
exports.createGuarantorSchema = zod_1.z.object({
    body: zod_1.z.object({
        customerId: zod_1.z.uuid({ message: "Invalid Customer ID format" }),
        fullName: zod_1.z.string().min(2),
        relationship: zod_1.z.string().min(2),
        phone: zod_1.z.string().min(10),
        email: zod_1.z.string().email().optional(),
        occupation: zod_1.z.string().optional(),
        address: zod_1.z.string().min(3),
    }),
});
exports.updateGuarantorSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.uuid({ message: "Invalid Guarantor ID format" }),
    }),
    body: zod_1.z.object({
        fullName: zod_1.z.string().min(2).optional(),
        relationship: zod_1.z.string().min(2).optional(),
        phone: zod_1.z.string().min(10).optional(),
        email: zod_1.z.string().email().optional(),
        occupation: zod_1.z.string().optional(),
        address: zod_1.z.string().min(3).optional(),
    }),
});
exports.idParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.uuid({ message: "Invalid Guarantor ID format" }),
    }),
});
