import { z } from "zod";

export const createCustomerSchema = z.object({
  // src/modules/customers/customer.validation.ts
// UPDATED — createCustomerSchema: branchId now optional. Rest of file unchanged.

  body: z.object({
    customerNumber: z.string().min(3),
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    middleName: z.string().optional(),
    gender: z.enum(["MALE", "FEMALE"]),
    dateOfBirth: z.coerce.date(),
    phone: z.string().min(10),
    alternatePhone: z.string().optional(),
    email: z.string().email(),
    nationality: z.string().optional(),
    bvn: z.string().length(11, "BVN must be 11 digits").optional(),
    nin: z.string().length(11, "NIN must be 11 digits").optional(),
    photoUrl: z.string().optional(),
    branchId: z.uuid({ message: "Invalid UUID format" }).optional(),

    address: z.object({
      addressLine1: z.string().min(3),
      addressLine2: z.string().optional(),
      city: z.string().min(2),
      state: z.string().min(2),
      country: z.string().min(2),
      postalCode: z.string().optional(),
    }),

    employment: z.object({
      employerName: z.string().min(2),
      occupation: z.string().min(2),
      monthlyIncome: z.number().nonnegative(),
      employerAddress: z.string().optional(),
      employmentDate: z.coerce.date().optional(),
    }),
  }),
});

export const updateCustomerSchema = z.object({
  params: z.object({
    id: z.uuid({ message: "Invalid Customer ID format" }), 
  }),
  body: z.object({
    firstName: z.string().min(2).optional(),
    lastName: z.string().min(2).optional(),
    middleName: z.string().optional(),
    phone: z.string().min(10).optional(),
    alternatePhone: z.string().optional(),
    email: z.string().email().optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  }),
});
