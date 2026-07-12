"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disburseLoanSchema = exports.listLoansSchema = void 0;
const zod_1 = require("zod");
exports.listLoansSchema = zod_1.z.object({
    query: zod_1.z.object({
        search: zod_1.z.string().optional(),
        status: zod_1.z.enum(['PENDING_DISBURSEMENT', 'ACTIVE', 'COMPLETED', 'DEFAULTED', 'WRITTEN_OFF', 'CANCELLED']).optional(),
    }),
});
exports.disburseLoanSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid(),
    }),
    body: zod_1.z.object({
        amount: zod_1.z.number().positive(),
        paymentMethod: zod_1.z.enum(['CASH', 'BANK_TRANSFER', 'POS', 'MOBILE_MONEY']),
        accountName: zod_1.z.string().optional(),
        accountNumber: zod_1.z.string().optional(),
        bankName: zod_1.z.string().optional(),
        remarks: zod_1.z.string().optional(),
    }),
});
