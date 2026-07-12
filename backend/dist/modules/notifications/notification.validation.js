"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendManualSmsSchema = exports.listSmsSchema = void 0;
const zod_1 = require("zod");
exports.listSmsSchema = zod_1.z.object({
    query: zod_1.z.object({
        search: zod_1.z.string().optional(),
        status: zod_1.z.enum(['PENDING', 'SENT', 'DELIVERED', 'FAILED']).optional(),
        page: zod_1.z.string().regex(/^\d+$/).optional(),
        pageSize: zod_1.z.string().regex(/^\d+$/).optional(),
    }),
});
exports.sendManualSmsSchema = zod_1.z.object({
    body: zod_1.z.object({
        customerId: zod_1.z.string().uuid().optional(),
        phone: zod_1.z.string().min(10),
        templateCode: zod_1.z.string(),
        variables: zod_1.z.record(zod_1.z.string(), zod_1.z.union([zod_1.z.string(), zod_1.z.number()])).optional(),
    }),
});
