import { z } from 'zod';

export const createSavingsAccountSchema = z.object({
  body: z.object({
    phone: z.string().min(7, 'Valid phone number is required'),

    firstName: z.string().min(2).optional(),

    lastName: z.string().min(2).optional(),

    branchId: z.string().uuid().optional(),

    initialDeposit: z.number().positive(
      'Initial deposit must be greater than 0'
    ),

    paymentMethod: z.enum([
      'CASH',
      'BANK_TRANSFER',
      'POS',
      'MOBILE_MONEY',
    ]),

    description: z.string().optional(),
  }),
});

export const depositSchema = z.object({
  body: z.object({
    savingsAccountId: z.string().uuid(),
    amount: z.number().positive(),
    paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'POS', 'MOBILE_MONEY']),
    description: z.string().optional(),
  }),
});

export const withdrawalSchema = z.object({
  body: z.object({
    savingsAccountId: z.string().uuid(),
    amount: z.number().positive(),
    paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'POS', 'MOBILE_MONEY']),
    description: z.string().optional(),
  }),
});

export const accountIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const listSavingsAccountsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'CLOSED']).optional(),
    page: z.coerce.number().int().positive().optional(),
    pageSize: z.coerce.number().int().positive().optional(),
  }),
});

export const listTransactionsSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    pageSize: z.coerce.number().int().positive().optional(),
  }),
});

export const provisionSavingsAccountSchema = z.object({
  body: z.object({
    phone: z.string().min(7),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    branchId: z.string().uuid().optional(),
    initialDeposit: z.number().positive(),
    paymentMethod: z.enum([
      'CASH',
      'BANK_TRANSFER',
      'POS',
      'MOBILE_MONEY',
    ]),
    description: z.string().optional(),
  }),
});