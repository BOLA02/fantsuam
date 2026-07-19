"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoanRepository = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
class LoanRepository {
    baseInclude = {
        customer: {
            select: { id: true, firstName: true, lastName: true },
        },
        schedules: {
            where: { status: { not: 'PAID' } },
            orderBy: { dueDate: 'asc' },
            take: 1,
        },
    };
    async findAll(params) {
        const where = {
            deletedAt: null,
            ...(params.status ? { status: params.status } : {}),
            ...(params.search
                ? {
                    OR: [
                        { loanNumber: { contains: params.search } },
                        { customer: { firstName: { contains: params.search } } },
                        { customer: { lastName: { contains: params.search } } },
                    ],
                }
                : {}),
        };
        return prisma_1.default.loan.findMany({
            where,
            include: this.baseInclude,
            orderBy: { createdAt: 'desc' },
        });
    }
    async findById(id) {
        return prisma_1.default.loan.findFirst({
            where: { id, deletedAt: null },
            include: {
                customer: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } },
                loanProduct: { select: { id: true, name: true, productCode: true } },
                schedules: { orderBy: { installmentNumber: 'asc' } },
                disbursements: true,
                repayments: { orderBy: { paymentDate: 'desc' } },
                penalties: true,
                statusHistory: { orderBy: { createdAt: 'desc' } },
            },
        });
    }
    async findByLoanNumber(loanNumber, client = prisma_1.default) {
        return client.loan.findUnique({ where: { loanNumber } });
    }
    /**
     * Creates a Loan row. Pass `client` as the same Prisma transaction client
     * used to flip the source LoanApplication's status, so both writes commit
     * or roll back together.
     */
    async create(data, client = prisma_1.default) {
        return client.loan.create({
            data: {
                loanNumber: data.loanNumber,
                applicationId: data.applicationId,
                customerId: data.customerId,
                loanProductId: data.loanProductId,
                principalAmount: data.principalAmount,
                interestRate: data.interestRate,
                processingFee: data.processingFee,
                approvedAmount: data.approvedAmount,
                disbursedAmount: 0,
                totalPayable: data.totalPayable,
                outstandingBalance: data.outstandingBalance,
                durationMonths: data.durationMonths,
                repaymentFrequency: data.repaymentFrequency,
                status: 'PENDING_DISBURSEMENT',
                approvalDate: data.approvalDate,
                remarks: data.remarks,
                statusHistory: {
                    create: {
                        status: 'PENDING_DISBURSEMENT',
                        remarks: 'Loan created from approved application',
                        changedById: data.changedById,
                    },
                },
            },
            include: {
                customer: true,
                loanProduct: true,
                statusHistory: true,
            },
        });
    }
    async disburse(loanId, data, client = prisma_1.default) {
        return client.loan.update({
            where: { id: loanId },
            data: {
                status: 'ACTIVE',
                disbursedAmount: data.amount,
                disbursementDate: data.disbursementDate,
                maturityDate: data.maturityDate,
                disbursements: {
                    create: {
                        referenceNumber: data.referenceNumber,
                        amount: data.amount,
                        paymentMethod: data.paymentMethod,
                        accountName: data.accountName,
                        accountNumber: data.accountNumber,
                        bankName: data.bankName,
                        remarks: data.remarks,
                        disbursedById: data.disbursedById,
                    },
                },
                schedules: {
                    create: data.schedules,
                },
                statusHistory: {
                    create: {
                        status: 'ACTIVE',
                        remarks: 'Loan disbursed',
                        changedById: data.disbursedById,
                    },
                },
            },
            include: {
                disbursements: true,
                schedules: { orderBy: { installmentNumber: 'asc' } },
                statusHistory: true,
            },
        });
    }
}
exports.LoanRepository = LoanRepository;
