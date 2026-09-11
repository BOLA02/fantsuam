import { z } from "zod";

const credentials = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const customerSignupSchema = z.object({ body: credentials });
export const verifiedCustomerSignupSchema = z.object({
  body: credentials.extend({
    phone: z.string().min(7),
    code: z.string().length(6),
  }),
});
export const customerLoginSchema = z.object({ body: credentials });
