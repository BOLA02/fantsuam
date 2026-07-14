"use strict";
// src/modules/search/search.repository.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../../config/prisma"));
const RESULT_LIMIT = 5;
class SearchRepository {
    async searchCustomers(keyword) {
        return prisma_1.default.customer.findMany({
            where: {
                deletedAt: null,
                OR: [
                    { customerNumber: { contains: keyword } },
                    { firstName: { contains: keyword } },
                    { lastName: { contains: keyword } },
                    { phone: { contains: keyword } },
                    { email: { contains: keyword } },
                ],
            },
            take: RESULT_LIMIT,
            orderBy: { createdAt: "desc" },
        });
    }
    async searchLoans(keyword) {
        return prisma_1.default.loan.findMany({
            where: {
                deletedAt: null,
                OR: [
                    { loanNumber: { contains: keyword } },
                    { customer: { firstName: { contains: keyword } } },
                    { customer: { lastName: { contains: keyword } } },
                    { customer: { customerNumber: { contains: keyword } } },
                ],
            },
            include: {
                customer: true,
            },
            take: RESULT_LIMIT,
            orderBy: { createdAt: "desc" },
        });
    }
    async searchLoanApplications(keyword) {
        return prisma_1.default.loanApplication.findMany({
            where: {
                OR: [
                    { applicationNumber: { contains: keyword } },
                    { customer: { firstName: { contains: keyword } } },
                    { customer: { lastName: { contains: keyword } } },
                    { customer: { customerNumber: { contains: keyword } } },
                ],
            },
            include: {
                customer: true,
            },
            take: RESULT_LIMIT,
            orderBy: { createdAt: "desc" },
        });
    }
    async searchUsers(keyword) {
        return prisma_1.default.user.findMany({
            where: {
                deletedAt: null,
                OR: [
                    { employeeNumber: { contains: keyword } },
                    { firstName: { contains: keyword } },
                    { lastName: { contains: keyword } },
                    { email: { contains: keyword } },
                    { phone: { contains: keyword } },
                ],
            },
            take: RESULT_LIMIT,
            orderBy: { createdAt: "desc" },
        });
    }
    async searchGuarantors(keyword) {
        return prisma_1.default.guarantor.findMany({
            where: {
                OR: [
                    { fullName: { contains: keyword } },
                    { phone: { contains: keyword } },
                    { email: { contains: keyword } },
                ],
            },
            include: {
                customer: true,
            },
            take: RESULT_LIMIT,
            orderBy: { createdAt: "desc" },
        });
    }
    async searchBranches(keyword) {
        return prisma_1.default.branch.findMany({
            where: {
                deletedAt: null,
                OR: [
                    { branchCode: { contains: keyword } },
                    { name: { contains: keyword } },
                ],
            },
            take: RESULT_LIMIT,
            orderBy: { createdAt: "desc" },
        });
    }
}
exports.default = new SearchRepository();
