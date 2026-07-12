"use strict";
// src/modules/loan-applications/loan-application.repository.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../../config/prisma"));
const client_1 = require("@prisma/client");
class LoanApplicationRepository {
    async findAll(filters) {
        return prisma_1.default.loanApplication.findMany({
            where: {
                status: filters.status
                    ? filters.status
                    : undefined,
                customerId: filters.customerId || undefined,
                loanProductId: filters.loanProductId || undefined,
                assignedOfficerId: filters.assignedOfficerId || undefined,
            },
            include: {
                customer: true,
                loanProduct: true,
                assignedOfficer: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }
    async findById(id) {
        return prisma_1.default.loanApplication.findUnique({
            where: { id },
            include: {
                customer: true,
                loanProduct: true,
                assignedOfficer: true,
                documents: true,
                reviews: {
                    include: { reviewer: true },
                    orderBy: { reviewedAt: "desc" },
                },
                statusHistory: {
                    include: { changedBy: true },
                    orderBy: { createdAt: "desc" },
                },
                loan: true,
            },
        });
    }
    async findByApplicationNumber(applicationNumber) {
        return prisma_1.default.loanApplication.findUnique({
            where: { applicationNumber },
        });
    }
    // src/modules/loan-applications/loan-application.repository.ts
    // UPDATED create() method only — rest of file unchanged
    async create(data) {
        return prisma_1.default.loanApplication.create({
            data: {
                applicationNumber: data.applicationNumber,
                customerId: data.customerId,
                loanProductId: data.loanProductId,
                assignedOfficerId: data.assignedOfficerId,
                requestedAmount: data.requestedAmount,
                purpose: data.purpose,
                durationMonths: data.durationMonths,
                remarks: data.remarks,
                status: client_1.ApplicationStatus.SUBMITTED,
                statusHistory: {
                    create: {
                        status: client_1.ApplicationStatus.SUBMITTED,
                        remarks: "Application submitted",
                        changedById: data.createdById,
                    },
                },
            },
            include: {
                customer: true,
                loanProduct: true,
                assignedOfficer: true,
                statusHistory: true,
            },
        });
    }
    async update(id, data) {
        return prisma_1.default.loanApplication.update({
            where: { id },
            data,
            include: {
                customer: true,
                loanProduct: true,
                assignedOfficer: true,
            },
        });
    }
    async assignOfficer(id, assignedOfficerId) {
        return prisma_1.default.loanApplication.update({
            where: { id },
            data: { assignedOfficerId },
            include: {
                customer: true,
                loanProduct: true,
                assignedOfficer: true,
            },
        });
    }
    async changeStatus(id, status, changedById, remarks, client) {
        const run = async (tx) => {
            const application = await tx.loanApplication.update({
                where: { id },
                data: {
                    status,
                    remarks: remarks ?? undefined,
                },
                include: {
                    customer: true,
                    loanProduct: true,
                    assignedOfficer: true,
                },
            });
            await tx.applicationStatusHistory.create({
                data: {
                    applicationId: id,
                    status,
                    remarks,
                    changedById,
                },
            });
            return application;
        };
        if (client) {
            return run(client);
        }
        return prisma_1.default.$transaction((tx) => run(tx));
    }
    async createReview(applicationId, reviewerId, recommendation, comments) {
        return prisma_1.default.applicationReview.create({
            data: {
                applicationId,
                reviewerId,
                recommendation,
                comments,
            },
            include: {
                reviewer: true,
            },
        });
    }
    async findReviews(applicationId) {
        return prisma_1.default.applicationReview.findMany({
            where: { applicationId },
            include: { reviewer: true },
            orderBy: { reviewedAt: "desc" },
        });
    }
    async findStatusHistory(applicationId) {
        return prisma_1.default.applicationStatusHistory.findMany({
            where: { applicationId },
            include: { changedBy: true },
            orderBy: { createdAt: "desc" },
        });
    }
    async countByProduct(loanProductId) {
        return prisma_1.default.loanApplication.count({
            where: { loanProductId },
        });
    }
}
exports.default = new LoanApplicationRepository();
