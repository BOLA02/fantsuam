// src/modules/loan-applications/loan-application.validation.ts

import { z } from "zod";

export const createLoanApplicationSchema = z.object({
  body: z.object({
    customerId: z.uuid({ message: "Invalid Customer ID format" }),
    loanProductId: z.uuid({ message: "Invalid Loan Product ID format" }),
    assignedOfficerId: z
      .uuid({ message: "Invalid Officer ID format" })
      .optional(),
    requestedAmount: z.coerce.number().positive(),
    purpose: z.string().min(3),
    durationMonths: z.coerce.number().int().positive(),
    remarks: z.string().optional(),
  }),
});

export const updateLoanApplicationSchema = z.object({
  params: z.object({
    id: z.uuid({ message: "Invalid Application ID format" }),
  }),
  body: z.object({
    requestedAmount: z.coerce.number().positive().optional(),
    purpose: z.string().min(3).optional(),
    durationMonths: z.coerce.number().int().positive().optional(),
    remarks: z.string().optional(),
  }),
});

export const assignOfficerSchema = z.object({
  params: z.object({
    id: z.uuid({ message: "Invalid Application ID format" }),
  }),
  body: z.object({
    assignedOfficerId: z.uuid({ message: "Invalid Officer ID format" }),
  }),
});

export const changeStatusSchema = z.object({
  params: z.object({
    id: z.uuid({ message: "Invalid Application ID format" }),
  }),
  body: z.object({
    status: z.enum([
      "SUBMITTED",
      "UNDER_REVIEW",
      "DOCUMENTS_REQUESTED",
      "APPROVED",
      "REJECTED",
      "CANCELLED",
    ]),
    remarks: z.string().optional(),
  }),
});

export const createReviewSchema = z.object({
  params: z.object({
    id: z.uuid({ message: "Invalid Application ID format" }),
  }),
  body: z.object({
    recommendation: z.string().min(2),
    comments: z.string().optional(),
  }),
});

export const idParamSchema = z.object({
  params: z.object({
    id: z.uuid({ message: "Invalid Application ID format" }),
  }),
});