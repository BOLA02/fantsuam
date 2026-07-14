"use strict";
// src/modules/settings/settings.validation.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSettingsSchema = void 0;
const zod_1 = require("zod");
exports.updateSettingsSchema = zod_1.z.object({
    body: zod_1.z.object({
        organizationName: zod_1.z.string().min(2).optional(),
        email: zod_1.z.string().email().optional(),
        phone: zod_1.z.string().min(10).optional(),
    }),
});
