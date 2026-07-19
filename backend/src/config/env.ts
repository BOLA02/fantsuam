// src/config/env.ts
// UPDATED — added Cloudinary vars, rest unchanged

import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: Number(process.env.PORT) || 5000,
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_SECRET: process.env.JWT_SECRET!,
  NODE_ENV: process.env.NODE_ENV || "development",
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME!,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY!,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET!,
  PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY || "",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
};
