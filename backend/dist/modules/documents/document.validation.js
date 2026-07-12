"use strict";
// src/modules/documents/document.validation.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.idParamSchema = exports.verifyDocumentSchema = exports.uploadDocumentSchema = void 0;
const zod_1 = require("zod");
const DOCUMENT_TYPES = [
    "PASSPORT",
    "NATIONAL_ID",
    "NIN",
    "BVN",
    "UTILITY_BILL",
    "BANK_STATEMENT",
    "EMPLOYMENT_LETTER",
    "BUSINESS_REGISTRATION",
    "COLLATERAL_DOCUMENT",
    "OTHER",
];
exports.uploadDocumentSchema = zod_1.z.object({
    body: zod_1.z.object({
        documentType: zod_1.z.enum(DOCUMENT_TYPES),
        customerId: zod_1.z.uuid().optional(),
        guarantorId: zod_1.z.uuid().optional(),
        applicationId: zod_1.z.uuid().optional(),
        collateralId: zod_1.z.uuid().optional(),
        remarks: zod_1.z.string().optional(),
    }),
});
exports.verifyDocumentSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.uuid({ message: "Invalid Document ID format" }),
    }),
    body: zod_1.z.object({
        verificationStatus: zod_1.z.enum(["VERIFIED", "REJECTED"]),
        remarks: zod_1.z.string().optional(),
    }),
});
exports.idParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.uuid({ message: "Invalid Document ID format" }),
    }),
});
