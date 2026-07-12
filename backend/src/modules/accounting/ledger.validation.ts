import { z } from 'zod';

export const listLedgerSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    loanId: z.string().uuid().optional(),
    page: z.string().regex(/^\d+$/).optional(),
    pageSize: z.string().regex(/^\d+$/).optional(),
  }),
});

export const loanLedgerParamSchema = z.object({
  params: z.object({
    loanId: z.string().uuid(),
  }),
});