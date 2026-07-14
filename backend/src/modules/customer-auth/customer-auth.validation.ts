import { z } from "zod";

const credentials = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const customerSignupSchema = z.object({ body: credentials });
export const customerLoginSchema = z.object({ body: credentials });
