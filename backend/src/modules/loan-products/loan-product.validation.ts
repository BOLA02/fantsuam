import { z } from 'zod';

const repaymentFrequencySchema = z.enum(['DAILY', 'WEEKLY', 'BI_WEEKLY', 'MONTHLY']);

// 1. Define raw body fields separately so they are clean and unrefined
const rawProductBodyFields = z.object({
  productCode: z.string().min(2).max(20).toUpperCase(),
  name: z.string().min(3).max(100),
  description: z.string().optional(),
  minimumAmount: z.number().positive(),
  maximumAmount: z.number().positive(),
  interestRate: z.number().nonnegative(),
  processingFee: z.number().nonnegative(),
  penaltyRate: z.number().nonnegative(),
  maximumDuration: z.number().int().positive(),
  repaymentFrequency: repaymentFrequencySchema,
  requiresGuarantor: z.boolean().default(true),
  requiresBVN: z.boolean().default(true),
  requiresNIN: z.boolean().default(false),
  
  fees: z.array(z.object({
    feeName: z.string().min(2),
    amount: z.number().nonnegative(),
    percentage: z.boolean().default(false)
  })).optional(),
  
  requirements: z.array(z.object({
    title: z.string().min(2),
    description: z.string().optional(),
    required: z.boolean().default(true)
  })).optional()
});

// 2. Build the Create validation payload by applying refinement rules to the fields
export const createProductSchema = z.object({
  body: rawProductBodyFields.refine((data) => data.maximumAmount >= data.minimumAmount, {
    message: "Maximum amount cannot be less than minimum amount",
    path: ["maximumAmount"],
  }),
});

// 3. Build the Update validation payload by making the raw unrefined fields partial first
export const updateProductSchema = z.object({
  body: rawProductBodyFields.partial().refine((data) => {
    // Only validate bounds if BOTH elements are being supplied during patch/update updates
    if (data.maximumAmount !== undefined && data.minimumAmount !== undefined) {
      return data.maximumAmount >= data.minimumAmount;
    }
    return true;
  }, {
    message: "Maximum amount cannot be less than minimum amount",
    path: ["maximumAmount"],
  }),
});

export const toggleProductSchema = z.object({
  body: z.object({
    isActive: z.boolean(),
  }),
});
