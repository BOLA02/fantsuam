"use strict";
// src/modules/resume/resume.service.ts
// FULL FILE — UPDATED: no shape change needed here, customer object is passed through as-is.
// (The bug was in the frontend mapping, not here — included for completeness/no drift.)
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AppError_1 = require("../../utils/AppError");
const customer_service_1 = __importDefault(require("../customers/customer.service"));
const loan_application_service_1 = __importDefault(require("../loan-applications/loan-application.service"));
const guarantor_service_1 = __importDefault(require("../guarantors/guarantor.service"));
const document_service_1 = __importDefault(require("../documents/document.service"));
class ResumeService {
    async getStateFromToken(resumeToken) {
        let payload;
        try {
            payload = jsonwebtoken_1.default.verify(resumeToken, process.env.JWT_SECRET || process.env.RESUME_TOKEN_SECRET || "change-me");
        }
        catch {
            throw new AppError_1.AppError(401, "This resume link has expired. Please verify your phone again.");
        }
        if (payload.purpose !== "resume" || !payload.customerId) {
            throw new AppError_1.AppError(401, "Invalid resume token");
        }
        return this.getState(payload.customerId);
    }
    async getState(customerId) {
        const customer = await customer_service_1.default.getById(customerId);
        const applications = await loan_application_service_1.default.getAll({ customerId });
        const latestApplication = Array.isArray(applications)
            ? [...applications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] ?? null
            : null;
        const guarantors = await guarantor_service_1.default.getAll(customerId);
        let documents = [];
        if (latestApplication) {
            documents = await document_service_1.default.getAll({ applicationId: latestApplication.id });
        }
        let resumeStep = 2;
        if (latestApplication)
            resumeStep = 3;
        if (guarantors && guarantors.length > 0)
            resumeStep = 4;
        if (documents && documents.length > 0)
            resumeStep = 5;
        return { customer, application: latestApplication, guarantors, documents, resumeStep };
    }
}
exports.default = new ResumeService();
