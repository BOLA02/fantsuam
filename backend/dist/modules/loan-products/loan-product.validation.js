"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleProductSchema = exports.updateProductSchema = exports.createProductSchema = void 0;
const zod_1 = require("zod");
const repaymentFrequencySchema = zod_1.z.enum(['DAILY', 'WEEKLY', 'BI_WEEKLY', 'MONTHLY']);
// 1. Define raw body fields separately so they are clean and unrefined
const rawProductBodyFields = zod_1.z.object({
    productCode: zod_1.z.string().min(2).max(20).toUpperCase(),
    name: zod_1.z.string().min(3).max(100),
    description: zod_1.z.string().optional(),
    minimumAmount: zod_1.z.number().positive(),
    maximumAmount: zod_1.z.number().positive(),
    interestRate: zod_1.z.number().nonnegative(),
    processingFee: zod_1.z.number().nonnegative(),
    penaltyRate: zod_1.z.number().nonnegative(),
    maximumDuration: zod_1.z.number().int().positive(),
    repaymentFrequency: repaymentFrequencySchema,
    requiresGuarantor: zod_1.z.boolean().default(true),
    requiresBVN: zod_1.z.boolean().default(true),
    requiresNIN: zod_1.z.boolean().default(false),
    fees: zod_1.z.array(zod_1.z.object({
        feeName: zod_1.z.string().min(2),
        amount: zod_1.z.number().nonnegative(),
        percentage: zod_1.z.boolean().default(false)
    })).optional(),
    requirements: zod_1.z.array(zod_1.z.object({
        title: zod_1.z.string().min(2),
        description: zod_1.z.string().optional(),
        required: zod_1.z.boolean().default(true)
    })).optional()
});
// 2. Build the Create validation payload by applying refinement rules to the fields
exports.createProductSchema = zod_1.z.object({
    body: rawProductBodyFields.refine((data) => data.maximumAmount >= data.minimumAmount, {
        message: "Maximum amount cannot be less than minimum amount",
        path: ["maximumAmount"],
    }),
});
// 3. Build the Update validation payload by making the raw unrefined fields partial first
exports.updateProductSchema = zod_1.z.object({
    body: rawProductBodyFields.partial().refine((data) => {
        // Only validate bounds if BOTH elements are being supplied during patch/update updates
        if (data.maximumAmount !== undefined && data.minimumAmount !== undefined) {
            return data.maximumAmount >= data.minimumAmount;
        }
        return true;
    }, {
        message: "Maximum amount cannot be less than minimum amount",
        path: ["maximumAmount"],
    }),
});
exports.toggleProductSchema = zod_1.z.object({
    body: zod_1.z.object({
        isActive: zod_1.z.boolean(),
    }),
});
