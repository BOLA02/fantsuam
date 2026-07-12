"use strict";
// src/modules/loan-applications/loan-application.validation.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.idParamSchema = exports.createReviewSchema = exports.changeStatusSchema = exports.assignOfficerSchema = exports.updateLoanApplicationSchema = exports.createLoanApplicationSchema = void 0;
const zod_1 = require("zod");
exports.createLoanApplicationSchema = zod_1.z.object({
    body: zod_1.z.object({
        customerId: zod_1.z.uuid({ message: "Invalid Customer ID format" }),
        loanProductId: zod_1.z.uuid({ message: "Invalid Loan Product ID format" }),
        assignedOfficerId: zod_1.z
            .uuid({ message: "Invalid Officer ID format" })
            .optional(),
        requestedAmount: zod_1.z.coerce.number().positive(),
        purpose: zod_1.z.string().min(3),
        durationMonths: zod_1.z.coerce.number().int().positive(),
        remarks: zod_1.z.string().optional(),
    }),
});
exports.updateLoanApplicationSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.uuid({ message: "Invalid Application ID format" }),
    }),
    body: zod_1.z.object({
        requestedAmount: zod_1.z.coerce.number().positive().optional(),
        purpose: zod_1.z.string().min(3).optional(),
        durationMonths: zod_1.z.coerce.number().int().positive().optional(),
        remarks: zod_1.z.string().optional(),
    }),
});
exports.assignOfficerSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.uuid({ message: "Invalid Application ID format" }),
    }),
    body: zod_1.z.object({
        assignedOfficerId: zod_1.z.uuid({ message: "Invalid Officer ID format" }),
    }),
});
exports.changeStatusSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.uuid({ message: "Invalid Application ID format" }),
    }),
    body: zod_1.z.object({
        status: zod_1.z.enum([
            "SUBMITTED",
            "UNDER_REVIEW",
            "DOCUMENTS_REQUESTED",
            "APPROVED",
            "REJECTED",
            "CANCELLED",
        ]),
        remarks: zod_1.z.string().optional(),
    }),
});
exports.createReviewSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.uuid({ message: "Invalid Application ID format" }),
    }),
    body: zod_1.z.object({
        recommendation: zod_1.z.string().min(2),
        comments: zod_1.z.string().optional(),
    }),
});
exports.idParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.uuid({ message: "Invalid Application ID format" }),
    }),
});
