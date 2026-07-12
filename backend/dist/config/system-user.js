"use strict";
// src/config/system-user.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSystemUserId = getSystemUserId;
const prisma_1 = __importDefault(require("./prisma"));
let cachedSystemUserId = null;
async function getSystemUserId() {
    if (cachedSystemUserId)
        return cachedSystemUserId;
    const user = await prisma_1.default.user.findFirstOrThrow({
        where: { email: "system@internal.local" },
    });
    cachedSystemUserId = user.id;
    return cachedSystemUserId;
}
