import { z } from 'zod';

export const listLoansSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    status: z.enum(['PENDING_DISBURSEMENT', 'ACTIVE', 'COMPLETED', 'DEFAULTED', 'WRITTEN_OFF', 'CANCELLED']).optional(),
  }),
});

export const disburseLoanSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    amount: z.number().positive(),
    paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'POS', 'MOBILE_MONEY']),
    accountName: z.string().optional(),
    accountNumber: z.string().optional(),
    bankName: z.string().optional(),
    remarks: z.string().optional(),
  }),
});