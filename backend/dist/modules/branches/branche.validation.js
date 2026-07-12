"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBranchSchema = exports.createBranchSchema = void 0;
const zod_1 = require("zod");
exports.createBranchSchema = zod_1.z.object({
    body: zod_1.z.object({
        branchCode: zod_1.z.string().min(2).max(10),
        name: zod_1.z.string().min(3),
        phone: zod_1.z.string().min(10),
        email: zod_1.z.string().email(),
        address: zod_1.z.string().min(5),
        city: zod_1.z.string().optional(),
        state: zod_1.z.string().optional(),
        country: zod_1.z.string().optional(),
    }),
});
exports.updateBranchSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(3).optional(),
        phone: zod_1.z.string().min(10).optional(),
        email: zod_1.z.string().email().optional(),
        address: zod_1.z.string().optional(),
        city: zod_1.z.string().optional(),
        state: zod_1.z.string().optional(),
        country: zod_1.z.string().optional(),
        isActive: zod_1.z.boolean().optional(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().uuid(),
    }),
});
