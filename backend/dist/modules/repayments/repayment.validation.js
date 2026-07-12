"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ledgerParamSchema = exports.listRepaymentsSchema = exports.confirmBankTransferSchema = exports.reportBankTransferSchema = exports.recordCashPaymentSchema = void 0;
const zod_1 = require("zod");
exports.recordCashPaymentSchema = zod_1.z.object({
    body: zod_1.z.object({
        loanId: zod_1.z.string().uuid(),
        amount: zod_1.z.number().positive(),
        paymentReference: zod_1.z.string().optional(),
        remarks: zod_1.z.string().optional(),
    }),
});
exports.reportBankTransferSchema = zod_1.z.object({
    body: zod_1.z.object({
        loanId: zod_1.z.string().uuid(),
        amount: zod_1.z.number().positive(),
        paymentReference: zod_1.z.string().optional(),
        remarks: zod_1.z.string().optional(),
    }),
});
exports.confirmBankTransferSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid(),
    }),
});
exports.listRepaymentsSchema = zod_1.z.object({
    query: zod_1.z.object({
        search: zod_1.z.string().optional(),
        status: zod_1.z.enum(['PENDING_VERIFICATION', 'CONFIRMED']).optional(),
        loanId: zod_1.z.string().uuid().optional(),
    }),
});
exports.ledgerParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        loanId: zod_1.z.string().uuid(),
    }),
});
