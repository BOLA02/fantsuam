// src/modules/guarantors/guarantor.validation.ts

import { z } from "zod";

export const createGuarantorSchema = z.object({
  body: z.object({
    customerId: z.uuid({ message: "Invalid Customer ID format" }),
    fullName: z.string().min(2),
    relationship: z.string().min(2),
    phone: z.string().min(10),
    email: z.string().email().optional(),
    occupation: z.string().optional(),
    address: z.string().min(3),
  }),
});

export const updateGuarantorSchema = z.object({
  params: z.object({
    id: z.uuid({ message: "Invalid Guarantor ID format" }),
  }),
  body: z.object({
    fullName: z.string().min(2).optional(),
    relationship: z.string().min(2).optional(),
    phone: z.string().min(10).optional(),
    email: z.string().email().optional(),
    occupation: z.string().optional(),
    address: z.string().min(3).optional(),
  }),
});

export const idParamSchema = z.object({
  params: z.object({
    id: z.uuid({ message: "Invalid Guarantor ID format" }),
  }),
});