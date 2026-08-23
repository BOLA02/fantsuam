"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SavingsRepository = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
class SavingsRepository {
    async findCustomerByPhone(phone, client = prisma_1.default) {
        return client.customer.findFirst({
            where: {
                phone,
                deletedAt: null,
            },
        });
    }
    async findAccountByCustomerId(customerId, client = prisma_1.default) {
        return client.savingsAccount.findFirst({
            where: {
                customerId,
                deletedAt: null,
            },
            include: {
                customer: true,
                branch: true,
            },
        });
    }
    async findAccountById(id, client = prisma_1.default) {
        return client.savingsAccount.findUnique({
            where: { id },
            include: {
                customer: true,
                branch: true,
            },
        });
    }
    async createAccount(data, client = prisma_1.default) {
        return client.savingsAccount.create({ data });
    }
    /**
     * Conditional update: succeeds only if the account's balance still
     * matches `expectedBalance`. Returns updated count — 0 means the
     * balance moved since it was read (concurrent transaction), and the
     * caller should retry with a fresh read.
     */
    async updateBalanceConditional(id, expectedBalance, newBalance, client = prisma_1.default) {
        return client.savingsAccount.updateMany({
            where: { id, balance: expectedBalance },
            data: { balance: newBalance },
        });
    }
    async findAllAccounts(params) {
        const page = params.page ?? 1;
        const pageSize = params.pageSize ?? 20;
        const where = {
            deletedAt: null,
            ...(params.status ? { status: params.status } : {}),
            ...(params.search
                ? {
                    OR: [
                        { accountNumber: { contains: params.search } },
                        {
                            customer: {
                                firstName: { contains: params.search },
                            },
                        },
                        {
                            customer: {
                                lastName: { contains: params.search },
                            },
                        },
                        {
                            customer: {
                                customerNumber: { contains: params.search },
                            },
                        },
                        {
                            customer: {
                                phone: { contains: params.search },
                            },
                        },
                    ],
                }
                : {}),
        };
        const [items, total] = await prisma_1.default.$transaction([
            prisma_1.default.savingsAccount.findMany({
                where,
                include: {
                    customer: true,
                    // Get only the most recent transaction
                    transactions: {
                        orderBy: {
                            transactionDate: 'desc',
                        },
                        take: 1,
                        select: {
                            id: true,
                            transactionType: true,
                            amount: true,
                            balanceAfter: true,
                            paymentMethod: true,
                            transactionDate: true,
                            reference: true,
                            description: true,
                        },
                    },
                },
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            prisma_1.default.savingsAccount.count({ where }),
        ]);
        return {
            items,
            total,
            page,
            pageSize,
        };
    }
    async createTransaction(data, client = prisma_1.default) {
        return client.savingsTransaction.create({
            data: data,
            include: { savingsAccount: true, performedBy: { select: { id: true, firstName: true, lastName: true } } },
        });
    }
    async findTransactionsByAccount(savingsAccountId, page, pageSize) {
        const [items, total] = await prisma_1.default.$transaction([
            prisma_1.default.savingsTransaction.findMany({
                where: { savingsAccountId },
                include: { performedBy: { select: { id: true, firstName: true, lastName: true } } },
                orderBy: { transactionDate: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            prisma_1.default.savingsTransaction.count({ where: { savingsAccountId } }),
        ]);
        return { items, total, page, pageSize };
    }
    async getSummary() {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const [totalSavings, activeAccounts, todaysDeposits, todaysWithdrawals] = await Promise.all([
            prisma_1.default.savingsAccount.aggregate({ _sum: { balance: true }, where: { status: 'ACTIVE', deletedAt: null } }),
            prisma_1.default.savingsAccount.count({ where: { status: 'ACTIVE', deletedAt: null } }),
            prisma_1.default.savingsTransaction.aggregate({
                _sum: { amount: true },
                where: { transactionType: 'DEPOSIT', transactionDate: { gte: startOfDay } },
            }),
            prisma_1.default.savingsTransaction.aggregate({
                _sum: { amount: true },
                where: { transactionType: 'WITHDRAWAL', transactionDate: { gte: startOfDay } },
            }),
        ]);
        return {
            totalSavings: totalSavings._sum.balance ?? 0,
            activeAccounts,
            todaysDeposits: todaysDeposits._sum.amount ?? 0,
            todaysWithdrawals: todaysWithdrawals._sum.amount ?? 0,
        };
    }
    async findSequence(entity, client = prisma_1.default) {
        return client.numberSequence.findUnique({ where: { entity } });
    }
    async upsertSequence(entity, defaults, client = prisma_1.default) {
        return client.numberSequence.upsert({
            where: { entity },
            create: { entity, ...defaults, currentNumber: 1 },
            update: { currentNumber: { increment: 1 } },
        });
    }
}
exports.SavingsRepository = SavingsRepository;
