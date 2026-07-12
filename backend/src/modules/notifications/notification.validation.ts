import { z } from 'zod';

export const listSmsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    status: z.enum(['PENDING', 'SENT', 'DELIVERED', 'FAILED']).optional(),
    page: z.string().regex(/^\d+$/).optional(),
    pageSize: z.string().regex(/^\d+$/).optional(),
  }),
});

export const sendManualSmsSchema = z.object({
  body: z.object({
    customerId: z.string().uuid().optional(),
    phone: z.string().min(10),
    templateCode: z.string(),
    variables: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
  }),
});