import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { env } from "./env"; // Loads your PORT, DATABASE_URL, etc.

// 🟢 FIX: Pass the raw environment string directly to the adapter
const adapter = new PrismaMariaDb(env.DATABASE_URL);

// Pass your connection options directly into the modern constructor 
const prisma = new PrismaClient({
  adapter,
  log: ["query", "info", "warn", "error"],
});

export default prisma;
