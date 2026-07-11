import { z } from "zod";

export const createUserSchema = z.object({
  body: z.object({
    employeeNumber: z.string().min(3),

    firstName: z.string().min(2),

    lastName: z.string().min(2),

    email: z.string().email(),

    phone: z.string().min(10).optional(),

    password: z.string().min(8),

    role: z.enum([
      "SUPER_ADMIN",
      "MANAGER",
      "LOAN_OFFICER",
      "CASHIER",
    ]),

    branchId: z.string().uuid(),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),

  body: z.object({
    firstName: z.string().min(2).optional(),

    lastName: z.string().min(2).optional(),

    email: z.string().email().optional(),

    phone: z.string().min(10).optional(),

    role: z
      .enum([
        "SUPER_ADMIN",
        "MANAGER",
        "LOAN_OFFICER",
        "CASHIER",
      ])
      .optional(),

    branchId: z.string().uuid().optional(),

    status: z
      .enum(["ACTIVE", "INACTIVE"])
      .optional(),
  }),
});

export const resetPasswordSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),

  body: z.object({
    password: z.string().min(8),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string(),

    newPassword: z.string().min(8),
  }),
});