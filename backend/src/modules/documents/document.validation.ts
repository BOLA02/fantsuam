// src/modules/documents/document.validation.ts

import { z } from "zod";

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
] as const;

export const uploadDocumentSchema = z.object({
  body: z.object({
    documentType: z.enum(DOCUMENT_TYPES),
    customerId: z.uuid().optional(),
    guarantorId: z.uuid().optional(),
    applicationId: z.uuid().optional(),
    collateralId: z.uuid().optional(),
    remarks: z.string().optional(),
  }),
});

export const verifyDocumentSchema = z.object({
  params: z.object({
    id: z.uuid({ message: "Invalid Document ID format" }),
  }),
  body: z.object({
    verificationStatus: z.enum(["VERIFIED", "REJECTED"]),
    remarks: z.string().optional(),
  }),
});

export const idParamSchema = z.object({
  params: z.object({
    id: z.uuid({ message: "Invalid Document ID format" }),
  }),
});