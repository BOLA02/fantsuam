"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.provisionSavingsAccountSchema = exports.listTransactionsSchema = exports.listSavingsAccountsSchema = exports.accountIdParamSchema = exports.withdrawalSchema = exports.depositSchema = exports.createSavingsAccountSchema = void 0;
const zod_1 = require("zod");
exports.createSavingsAccountSchema = zod_1.z.object({
    body: zod_1.z.object({
        phone: zod_1.z.string().min(7, 'Valid phone number is required'),
        firstName: zod_1.z.string().min(2).optional(),
        lastName: zod_1.z.string().min(2).optional(),
        branchId: zod_1.z.string().uuid().optional(),
        initialDeposit: zod_1.z.number().positive('Initial deposit must be greater than 0'),
        paymentMethod: zod_1.z.enum([
            'CASH',
            'BANK_TRANSFER',
            'POS',
            'MOBILE_MONEY',
        ]),
        description: zod_1.z.string().optional(),
    }),
});
exports.depositSchema = zod_1.z.object({
    body: zod_1.z.object({
        savingsAccountId: zod_1.z.string().uuid(),
        amount: zod_1.z.number().positive(),
        paymentMethod: zod_1.z.enum(['CASH', 'BANK_TRANSFER', 'POS', 'MOBILE_MONEY']),
        description: zod_1.z.string().optional(),
    }),
});
exports.withdrawalSchema = zod_1.z.object({
    body: zod_1.z.object({
        savingsAccountId: zod_1.z.string().uuid(),
        amount: zod_1.z.number().positive(),
        paymentMethod: zod_1.z.enum(['CASH', 'BANK_TRANSFER', 'POS', 'MOBILE_MONEY']),
        description: zod_1.z.string().optional(),
    }),
});
exports.accountIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid(),
    }),
});
exports.listSavingsAccountsSchema = zod_1.z.object({
    query: zod_1.z.object({
        search: zod_1.z.string().optional(),
        status: zod_1.z.enum(['ACTIVE', 'INACTIVE', 'CLOSED']).optional(),
        page: zod_1.z.coerce.number().int().positive().optional(),
        pageSize: zod_1.z.coerce.number().int().positive().optional(),
    }),
});
exports.listTransactionsSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid(),
    }),
    query: zod_1.z.object({
        page: zod_1.z.coerce.number().int().positive().optional(),
        pageSize: zod_1.z.coerce.number().int().positive().optional(),
    }),
});
exports.provisionSavingsAccountSchema = zod_1.z.object({
    body: zod_1.z.object({
        phone: zod_1.z.string().min(7),
        firstName: zod_1.z.string().optional(),
        lastName: zod_1.z.string().optional(),
        branchId: zod_1.z.string().uuid().optional(),
        initialDeposit: zod_1.z.number().positive(),
        paymentMethod: zod_1.z.enum([
            'CASH',
            'BANK_TRANSFER',
            'POS',
            'MOBILE_MONEY',
        ]),
        description: zod_1.z.string().optional(),
    }),
});
