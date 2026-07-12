"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loanLedgerParamSchema = exports.listLedgerSchema = void 0;
const zod_1 = require("zod");
exports.listLedgerSchema = zod_1.z.object({
    query: zod_1.z.object({
        search: zod_1.z.string().optional(),
        loanId: zod_1.z.string().uuid().optional(),
        page: zod_1.z.string().regex(/^\d+$/).optional(),
        pageSize: zod_1.z.string().regex(/^\d+$/).optional(),
    }),
});
exports.loanLedgerParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        loanId: zod_1.z.string().uuid(),
    }),
});
