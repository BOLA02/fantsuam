"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireApplicationFee = requireApplicationFee;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../config/prisma"));
const env_1 = require("../config/env");
async function requireApplicationFee(req, res, next) {
    const settings = await prisma_1.default.organizationSettings.findFirst();
    if (!settings?.applicationFeeEnabled || settings.applicationFeeAmount <= 0)
        return next();
    try {
        const token = req.header("X-Application-Fee-Token");
        if (!token)
            throw new Error("missing token");
        const payload = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        if (payload.purpose !== "APPLICATION_FEE" || !payload.paymentId)
            throw new Error("invalid token");
        const payment = await prisma_1.default.applicationFeePayment.findUnique({ where: { id: payload.paymentId } });
        if (!payment || payment.status !== "SUCCESS" || payment.amount !== settings.applicationFeeAmount)
            throw new Error("unpaid");
        next();
    }
    catch {
        res.status(402).json({ success: false, message: "A verified application-fee payment is required before applying" });
    }
}
