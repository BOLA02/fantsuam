"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../../config/prisma"));
const env_1 = require("../../config/env");
const AppError_1 = require("../../utils/AppError");
const router = (0, express_1.Router)();
function applicationToken(paymentId) {
    return jsonwebtoken_1.default.sign({ paymentId, purpose: "APPLICATION_FEE" }, env_1.env.JWT_SECRET, { expiresIn: "24h" });
}
async function getConfiguration() {
    const settings = await prisma_1.default.organizationSettings.findFirst();
    return {
        enabled: Boolean(settings?.applicationFeeEnabled && settings.applicationFeeAmount > 0),
        amount: settings?.applicationFeeAmount ?? 0,
        currency: "NGN",
    };
}
router.get("/config", async (_req, res, next) => {
    try {
        res.json({ success: true, data: await getConfiguration() });
    }
    catch (error) {
        next(error);
    }
});
router.post("/initialize", async (req, res, next) => {
    try {
        const email = String(req.body?.email ?? "").trim().toLowerCase();
        if (!/^\S+@\S+\.\S+$/.test(email))
            throw new AppError_1.AppError(400, "A valid email address is required");
        if (!env_1.env.PAYSTACK_SECRET_KEY)
            throw new AppError_1.AppError(503, "Online payments are not configured yet");
        const config = await getConfiguration();
        if (!config.enabled)
            throw new AppError_1.AppError(400, "The application fee is currently disabled");
        const reference = `APPFEE-${Date.now()}-${crypto_1.default.randomBytes(5).toString("hex")}`;
        await prisma_1.default.applicationFeePayment.create({ data: { reference, email, amount: config.amount } });
        const response = await fetch("https://api.paystack.co/transaction/initialize", {
            method: "POST",
            headers: { Authorization: `Bearer ${env_1.env.PAYSTACK_SECRET_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                email,
                amount: config.amount,
                reference,
                callback_url: `${env_1.env.FRONTEND_URL}/application-fee/verify`,
                metadata: { purpose: "loan_application_fee" },
            }),
        });
        const payload = await response.json();
        if (!response.ok || !payload.status || !payload.data?.authorization_url) {
            throw new AppError_1.AppError(502, payload.message || "Could not start the Paystack payment");
        }
        res.status(201).json({ success: true, data: { authorizationUrl: payload.data.authorization_url } });
    }
    catch (error) {
        next(error);
    }
});
router.get("/verify/:reference", async (req, res, next) => {
    try {
        if (!env_1.env.PAYSTACK_SECRET_KEY)
            throw new AppError_1.AppError(503, "Online payments are not configured yet");
        const reference = req.params.reference;
        const payment = await prisma_1.default.applicationFeePayment.findUnique({ where: { reference } });
        if (!payment)
            throw new AppError_1.AppError(404, "Application-fee payment not found");
        const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
            headers: { Authorization: `Bearer ${env_1.env.PAYSTACK_SECRET_KEY}` },
        });
        const payload = await response.json();
        const transaction = payload.data;
        const verified = response.ok && payload.status && transaction?.status === "success" && transaction.amount === payment.amount;
        if (!verified) {
            await prisma_1.default.applicationFeePayment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
            throw new AppError_1.AppError(400, "Payment was not successful or the amount did not match");
        }
        const settled = await prisma_1.default.applicationFeePayment.update({
            where: { id: payment.id },
            data: { status: "SUCCESS", paystackId: String(transaction.id), paidAt: new Date(transaction.paid_at) },
        });
        res.json({ success: true, data: { token: applicationToken(settled.id) } });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
