"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_mariadb_1 = require("@prisma/adapter-mariadb");
const env_1 = require("./env"); // Loads your PORT, DATABASE_URL, etc.
// 🟢 FIX: Pass the raw environment string directly to the adapter
const adapter = new adapter_mariadb_1.PrismaMariaDb(env_1.env.DATABASE_URL);
// Pass your connection options directly into the modern constructor 
const prisma = new client_1.PrismaClient({
    adapter,
    log: ["query", "info", "warn", "error"],
});
exports.default = prisma;
