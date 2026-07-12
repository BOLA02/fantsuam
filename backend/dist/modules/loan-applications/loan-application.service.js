"use strict";
// src/modules/loan-applications/loan-application.service.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../../config/prisma"));
const client_1 = require("@prisma/client");
const AppError_1 = require("../../utils/AppError");
const loan_application_repository_1 = __importDefault(require("./loan-application.repository"));
const notification_service_1 = require("../notifications/notification.service");
const loan_service_1 = require("../loans/loan.service");
// Allowed forward transitions for application status.
// APPROVED / REJECTED / CANCELLED are terminal states in this module.
const STATUS_TRANSITIONS = {
    DRAFT: ["SUBMITTED", "CANCELLED"],
    SUBMITTED: ["UNDER_REVIEW", "CANCELLED"],
    UNDER_REVIEW: [
        "DOCUMENTS_REQUESTED",
        "APPROVED",
        "REJECTED",
        "CANCELLED",
    ],
    DOCUMENTS_REQUESTED: ["UNDER_REVIEW", "CANCELLED"],
    APPROVED: [],
    REJECTED: [],
    CANCELLED: [],
};
const notifications = new notification_service_1.NotificationService();
class LoanApplicationService {
    loanService = new loan_service_1.LoanService();
    async generateApplicationNumber() {
        const datePart = new Date()
            .toISOString()
            .slice(0, 10)
            .replace(/-/g, "");
        // Retry loop to guarantee uniqueness against the @unique constraint
        for (let attempt = 0; attempt < 5; attempt++) {
            const randomPart = Math.floor(100000 + Math.random() * 900000);
            const candidate = `APP-${datePart}-${randomPart}`;
            const existing = await loan_application_repository_1.default.findByApplicationNumber(candidate);
            if (!existing) {
                return candidate;
            }
        }
        throw new AppError_1.AppError(500, "Failed to generate application number");
    }
    async getAll(filters) {
        return loan_application_repository_1.default.findAll(filters);
    }
    async getById(id) {
        const application = await loan_application_repository_1.default.findById(id);
        if (!application) {
            throw new AppError_1.AppError(404, "Loan application not found");
        }
        return application;
    }
    // src/modules/loan-applications/loan-application.service.ts
    // UPDATED create() method only — rest of file unchanged
    async create(data, createdById) {
        const customer = await prisma_1.default.customer.findFirst({
            where: { id: data.customerId, deletedAt: null },
        });
        if (!customer) {
            throw new AppError_1.AppError(404, "Customer not found");
        }
        if (customer.status !== "ACTIVE") {
            throw new AppError_1.AppError(400, "Customer is not active");
        }
        const loanProduct = await prisma_1.default.loanProduct.findFirst({
            where: { id: data.loanProductId, deletedAt: null },
        });
        if (!loanProduct) {
            throw new AppError_1.AppError(404, "Loan product not found");
        }
        if (!loanProduct.isActive) {
            throw new AppError_1.AppError(400, "Loan product is not active");
        }
        if (Number(data.requestedAmount) < Number(loanProduct.minimumAmount) ||
            Number(data.requestedAmount) > Number(loanProduct.maximumAmount)) {
            throw new AppError_1.AppError(400, `Requested amount must be between ${loanProduct.minimumAmount} and ${loanProduct.maximumAmount}`);
        }
        if (data.durationMonths > loanProduct.maximumDuration) {
            throw new AppError_1.AppError(400, `Duration must not exceed ${loanProduct.maximumDuration} months`);
        }
        if (data.assignedOfficerId) {
            const officer = await prisma_1.default.user.findFirst({
                where: {
                    id: data.assignedOfficerId,
                    deletedAt: null,
                },
            });
            if (!officer) {
                throw new AppError_1.AppError(404, "Assigned officer not found");
            }
            if (officer.status !== "ACTIVE") {
                throw new AppError_1.AppError(400, "Assigned officer is not active");
            }
            if (officer.role !== client_1.UserRole.LOAN_OFFICER) {
                throw new AppError_1.AppError(400, "Assigned user must be a Loan Officer");
            }
        }
        const applicationNumber = await this.generateApplicationNumber();
        const application = await loan_application_repository_1.default.create({
            applicationNumber,
            customerId: data.customerId,
            loanProductId: data.loanProductId,
            assignedOfficerId: data.assignedOfficerId,
            requestedAmount: data.requestedAmount,
            purpose: data.purpose,
            durationMonths: data.durationMonths,
            remarks: data.remarks,
            createdById,
        });
        if (customer.phone) {
            await notifications.sendSms({
                customerId: customer.id,
                phone: customer.phone,
                templateCode: 'APPLICATION_SUBMITTED',
                variables: {
                    firstName: customer.firstName,
                    applicationNumber,
                    amount: Number(data.requestedAmount),
                },
            });
        }
        return application;
    }
    async update(id, data) {
        const application = await this.getById(id);
        if (application.status !== client_1.ApplicationStatus.DRAFT &&
            application.status !== client_1.ApplicationStatus.SUBMITTED) {
            throw new AppError_1.AppError(400, "Only DRAFT or SUBMITTED applications can be edited");
        }
        if (data.requestedAmount !== undefined ||
            data.durationMonths !== undefined) {
            const requestedAmount = data.requestedAmount ?? Number(application.requestedAmount);
            const durationMonths = data.durationMonths ?? application.durationMonths;
            const loanProduct = application.loanProduct;
            if (requestedAmount < Number(loanProduct.minimumAmount) ||
                requestedAmount > Number(loanProduct.maximumAmount)) {
                throw new AppError_1.AppError(400, `Requested amount must be between ${loanProduct.minimumAmount} and ${loanProduct.maximumAmount}`);
            }
            if (durationMonths > loanProduct.maximumDuration) {
                throw new AppError_1.AppError(400, `Duration must not exceed ${loanProduct.maximumDuration} months`);
            }
        }
        return loan_application_repository_1.default.update(id, data);
    }
    async assignOfficer(id, assignedOfficerId) {
        await this.getById(id);
        const officer = await prisma_1.default.user.findFirst({
            where: { id: assignedOfficerId, deletedAt: null },
        });
        if (!officer) {
            throw new AppError_1.AppError(404, "Officer not found");
        }
        if (officer.status !== "ACTIVE") {
            throw new AppError_1.AppError(400, "Officer is not active");
        }
        if (officer.role !== client_1.UserRole.LOAN_OFFICER) {
            throw new AppError_1.AppError(400, "Assigned user must be a Loan Officer");
        }
        return loan_application_repository_1.default.assignOfficer(id, assignedOfficerId);
    }
    // src/modules/loan-applications/loan-application.service.ts
    // UPDATED — changeStatus() now enforces requiresGuarantor. Rest of file unchanged.
    async changeStatus(id, newStatus, changedById, remarks) {
        const application = await this.getById(id);
        const allowedNext = STATUS_TRANSITIONS[application.status];
        if (!allowedNext.includes(newStatus)) {
            throw new AppError_1.AppError(400, `Cannot transition application from ${application.status} to ${newStatus}`);
        }
        if (newStatus === client_1.ApplicationStatus.UNDER_REVIEW &&
            application.loanProduct.requiresGuarantor) {
            const guarantorCount = await prisma_1.default.guarantor.count({
                where: { customerId: application.customerId },
            });
            if (guarantorCount === 0) {
                throw new AppError_1.AppError(400, "This loan product requires at least one guarantor before review");
            }
        }
        // APPROVED also creates the Loan. Both writes share one transaction so
        // the application can never end up APPROVED without a matching Loan.
        if (newStatus === client_1.ApplicationStatus.APPROVED) {
            return prisma_1.default.$transaction(async (tx) => {
                const updatedApplication = await loan_application_repository_1.default.changeStatus(id, newStatus, changedById, remarks, tx);
                await this.loanService.createFromApplication(updatedApplication, changedById, tx);
                return updatedApplication;
            });
        }
        return loan_application_repository_1.default.changeStatus(id, newStatus, changedById, remarks);
    }
    async cancel(id, changedById, remarks) {
        const application = await this.getById(id);
        if (application.status !== client_1.ApplicationStatus.DRAFT &&
            application.status !== client_1.ApplicationStatus.SUBMITTED) {
            throw new AppError_1.AppError(400, "Only DRAFT or SUBMITTED applications can be cancelled");
        }
        return this.changeStatus(id, client_1.ApplicationStatus.CANCELLED, changedById, remarks ?? "Application cancelled");
    }
    async addReview(applicationId, reviewerId, recommendation, comments) {
        await this.getById(applicationId);
        return loan_application_repository_1.default.createReview(applicationId, reviewerId, recommendation, comments);
    }
    async getReviews(applicationId) {
        await this.getById(applicationId);
        return loan_application_repository_1.default.findReviews(applicationId);
    }
    async getStatusHistory(applicationId) {
        await this.getById(applicationId);
        return loan_application_repository_1.default.findStatusHistory(applicationId);
    }
}
exports.default = new LoanApplicationService();
