"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LedgerRepository = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
class LedgerRepository {
    /** Last ledger balance recorded for this loan, or 0 if none exist yet. */
    async getLastBalance(loanId, client) {
        const last = await client.ledgerEntry.findFirst({
            where: { transaction: { loanId } },
            orderBy: { createdAt: 'desc' },
        });
        return last ? Number(last.balance) : 0;
    }
    async generateLedgerNumber(client) {
        const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        for (let attempt = 0; attempt < 5; attempt++) {
            const randomPart = Math.floor(100000 + Math.random() * 900000);
            const candidate = `LDG-${datePart}-${randomPart}`;
            const existing = await client.ledgerEntry.findUnique({ where: { ledgerNumber: candidate } });
            if (!existing)
                return candidate;
        }
        throw new Error('Failed to generate ledger number');
    }
    async generateTransactionNumber(client) {
        const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        for (let attempt = 0; attempt < 5; attempt++) {
            const randomPart = Math.floor(100000 + Math.random() * 900000);
            const candidate = `TXN-${datePart}-${randomPart}`;
            const existing = await client.transaction.findUnique({ where: { transactionNumber: candidate } });
            if (!existing)
                return candidate;
        }
        throw new Error('Failed to generate transaction number');
    }
    async createEntry(input, client) {
        const transactionNumber = await this.generateTransactionNumber(client);
        const transaction = await client.transaction.create({
            data: {
                transactionNumber,
                loanId: input.loanId,
                repaymentId: input.repaymentId,
                penaltyId: input.penaltyId,
                transactionType: input.transactionType,
                amount: input.amount,
                paymentMethod: input.paymentMethod,
                reference: input.reference,
                narration: input.narration,
            },
        });
        const ledgerNumber = await this.generateLedgerNumber(client);
        return client.ledgerEntry.create({
            data: {
                ledgerNumber,
                transactionId: transaction.id,
                debit: input.debit,
                credit: input.credit,
                balance: input.balance,
                narration: input.narration,
            },
        });
    }
    async findAll(query) {
        const page = query.page ?? 1;
        const pageSize = query.pageSize ?? 50;
        const where = {
            ...(query.loanId ? { transaction: { loanId: query.loanId } } : {}),
            ...(query.search
                ? {
                    OR: [
                        { narration: { contains: query.search } },
                        { ledgerNumber: { contains: query.search } },
                        { transaction: { transactionNumber: { contains: query.search } } },
                        { transaction: { loan: { loanNumber: { contains: query.search } } } },
                    ],
                }
                : {}),
        };
        return prisma_1.default.ledgerEntry.findMany({
            where,
            include: {
                transaction: {
                    include: {
                        loan: { include: { customer: true } },
                        repayment: { include: { receivedBy: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * pageSize,
            take: pageSize,
        });
    }
    async findByLoan(loanId) {
        return prisma_1.default.ledgerEntry.findMany({
            where: { transaction: { loanId } },
            include: { transaction: true },
            orderBy: { createdAt: 'asc' },
        });
    }
}
exports.LedgerRepository = LedgerRepository;
