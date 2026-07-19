// src/modules/settings/settings.validation.ts

import { z } from "zod";

export const updateSettingsSchema = z.object({
  body: z.object({
    organizationName: z.string().min(2).optional(),
    email: z.string().email().optional(),
    phone: z.string().min(10).optional(),
    applicationFeeEnabled: z.boolean().optional(),
    applicationFeeAmount: z.number().int().min(0).optional(),
  }),
});
