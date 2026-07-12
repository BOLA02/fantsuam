"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepaymentRepository = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
class RepaymentRepository {
    async findByReceiptNumber(receiptNumber, client = prisma_1.default) {
        return client.repayment.findUnique({ where: { receiptNumber } });
    }
    async findById(id, client = prisma_1.default) {
        return client.repayment.findUnique({
            where: { id },
            include: { loan: true },
        });
    }
    async create(data, client = prisma_1.default) {
        return client.repayment.create({ data });
    }
    async confirmRow(id, data, client = prisma_1.default) {
        return client.repayment.update({ where: { id }, data });
    }
    async findAll(params) {
        const where = {
            ...(params.status ? { confirmationStatus: params.status } : {}),
            ...(params.loanId ? { loanId: params.loanId } : {}),
            ...(params.search
                ? {
                    loan: {
                        customer: {
                            OR: [
                                { firstName: { contains: params.search } },
                                { lastName: { contains: params.search } },
                            ],
                        },
                    },
                }
                : {}),
        };
        return prisma_1.default.repayment.findMany({
            where,
            include: {
                loan: { include: { customer: true } },
                schedule: true,
                receivedBy: { select: { id: true, firstName: true, lastName: true } },
                confirmedBy: { select: { id: true, firstName: true, lastName: true } },
            },
            orderBy: { paymentDate: 'desc' },
        });
    }
    async findLedgerByLoan(loanId) {
        return prisma_1.default.repayment.findMany({
            where: { loanId },
            include: {
                schedule: true,
                receivedBy: { select: { id: true, firstName: true, lastName: true } },
                confirmedBy: { select: { id: true, firstName: true, lastName: true } },
            },
            orderBy: { paymentDate: 'asc' },
        });
    }
}
exports.RepaymentRepository = RepaymentRepository;
