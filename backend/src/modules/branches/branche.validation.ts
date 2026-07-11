import { z } from "zod";

export const createBranchSchema = z.object({
  body: z.object({
    branchCode: z.string().min(2).max(10),
    name: z.string().min(3),
    phone: z.string().min(10),
    email: z.string().email(),
    address: z.string().min(5),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
  }),
});

export const updateBranchSchema = z.object({
  body: z.object({
    name: z.string().min(3).optional(),
    phone: z.string().min(10).optional(),
    email: z.string().email().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    isActive: z.boolean().optional(),
  }),

  params: z.object({
    id: z.string().uuid(),
  }),
});