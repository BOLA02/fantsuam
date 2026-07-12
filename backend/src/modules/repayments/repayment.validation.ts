import { z } from 'zod';

export const recordCashPaymentSchema = z.object({
  body: z.object({
    loanId: z.string().uuid(),
    amount: z.number().positive(),
    paymentReference: z.string().optional(),
    remarks: z.string().optional(),
  }),
});

export const reportBankTransferSchema = z.object({
  body: z.object({
    loanId: z.string().uuid(),
    amount: z.number().positive(),
    paymentReference: z.string().optional(),
    remarks: z.string().optional(),
  }),
});

export const confirmBankTransferSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const listRepaymentsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    status: z.enum(['PENDING_VERIFICATION', 'CONFIRMED']).optional(),
    loanId: z.string().uuid().optional(),
  }),
});

export const ledgerParamSchema = z.object({
  params: z.object({
    loanId: z.string().uuid(),
  }),
});