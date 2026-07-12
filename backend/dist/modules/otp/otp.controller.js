"use strict";
// src/modules/otp/otp.controller.ts
// NEW FILE — adjust to match your existing controller conventions (asyncHandler etc.)
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestOtp = requestOtp;
exports.verifyOtp = verifyOtp;
const otp_service_1 = __importDefault(require("./otp.service"));
async function requestOtp(req, res, next) {
    try {
        const { phone } = req.body;
        const result = await otp_service_1.default.requestOtp(phone);
        res.status(200).json({ data: result });
    }
    catch (err) {
        next(err);
    }
}
async function verifyOtp(req, res, next) {
    try {
        const { phone, code } = req.body;
        const result = await otp_service_1.default.verifyOtp(phone, code);
        res.status(200).json({ data: result });
    }
    catch (err) {
        next(err);
    }
}
