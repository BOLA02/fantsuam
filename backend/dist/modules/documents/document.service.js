"use strict";
// src/modules/documents/document.service.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../../config/prisma"));
const AppError_1 = require("../../utils/AppError");
const document_repository_1 = __importDefault(require("./document.repository"));
class DocumentService {
    async getAll(filters) {
        return document_repository_1.default.findAll(filters);
    }
    async getById(id) {
        const document = await document_repository_1.default.findById(id);
        if (!document) {
            throw new AppError_1.AppError(404, "Document not found");
        }
        return document;
    }
    async upload(data, file, uploadedById) {
        if (!data.customerId &&
            !data.guarantorId &&
            !data.applicationId &&
            !data.collateralId) {
            throw new AppError_1.AppError(400, "Document must be linked to a customer, guarantor, application, or collateral");
        }
        if (data.customerId) {
            const customer = await prisma_1.default.customer.findFirst({
                where: { id: data.customerId, deletedAt: null },
            });
            if (!customer) {
                throw new AppError_1.AppError(404, "Customer not found");
            }
        }
        if (data.guarantorId) {
            const guarantor = await prisma_1.default.guarantor.findUnique({
                where: { id: data.guarantorId },
            });
            if (!guarantor) {
                throw new AppError_1.AppError(404, "Guarantor not found");
            }
        }
        if (data.applicationId) {
            const application = await prisma_1.default.loanApplication.findUnique({
                where: { id: data.applicationId },
            });
            if (!application) {
                throw new AppError_1.AppError(404, "Loan application not found");
            }
        }
        return document_repository_1.default.create({
            fileName: file.filename ?? file.originalname,
            originalFileName: file.originalname,
            mimeType: file.mimetype,
            fileSize: file.size,
            fileUrl: file.path,
            documentType: data.documentType,
            customerId: data.customerId,
            guarantorId: data.guarantorId,
            applicationId: data.applicationId,
            collateralId: data.collateralId,
            remarks: data.remarks,
            uploadedById,
        });
    }
    async verify(id, verificationStatus, remarks) {
        await this.getById(id);
        return document_repository_1.default.updateVerification(id, verificationStatus, remarks);
    }
    async delete(id) {
        await this.getById(id);
        return document_repository_1.default.delete(id);
    }
}
exports.default = new DocumentService();
