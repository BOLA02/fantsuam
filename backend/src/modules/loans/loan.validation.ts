import { z } from 'zod';

export const listLoansSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    status: z.enum(['PENDING_DISBURSEMENT', 'ACTIVE', 'COMPLETED', 'DEFAULTED', 'WRITTEN_OFF', 'CANCELLED']).optional(),
  }),
});