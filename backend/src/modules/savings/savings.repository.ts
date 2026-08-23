import prisma from '../../config/prisma';
import { Prisma } from '@prisma/client';
import { SavingsAccountListQuery } from './savings.types';

type DbClient = typeof prisma | Prisma.TransactionClient;

export class SavingsRepository {

async findCustomerByPhone(
  phone: string,
  client: DbClient = prisma
) {
  return client.customer.findFirst({
    where: {
      phone,
      deletedAt: null,
    },
  });
}

async findAccountByCustomerId(
  customerId: string,
  client: DbClient = prisma
) {
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

  async findAccountById(
    id: string,
    client: DbClient = prisma
  ) {
    return client.savingsAccount.findUnique({
      where: { id },
      include: {
        customer: true,
        branch: true,
      },
    });}

  async createAccount(
    data: { accountNumber: string; customerId: string; branchId?: string },
    client: DbClient = prisma
  ) {
    return client.savingsAccount.create({ data });
  }

  /**
   * Conditional update: succeeds only if the account's balance still
   * matches `expectedBalance`. Returns updated count — 0 means the
   * balance moved since it was read (concurrent transaction), and the
   * caller should retry with a fresh read.
   */
  async updateBalanceConditional(
    id: string,
    expectedBalance: Prisma.Decimal | number,
    newBalance: number,
    client: DbClient = prisma
  ) {
    return client.savingsAccount.updateMany({
      where: { id, balance: expectedBalance as any },
      data: { balance: newBalance },
    });
  }

  async findAllAccounts(params: SavingsAccountListQuery) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;

  const where: Prisma.SavingsAccountWhereInput = {
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

  const [items, total] = await prisma.$transaction([
    prisma.savingsAccount.findMany({
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

    prisma.savingsAccount.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
  };
}

  async createTransaction(
    data: {
      reference: string;
      savingsAccountId: string;
      transactionType: 'DEPOSIT' | 'WITHDRAWAL' | 'ADJUSTMENT';
      amount: number;
      balanceBefore: Prisma.Decimal | number;
      balanceAfter: number;
      paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'POS' | 'MOBILE_MONEY';
      description?: string;
      performedById: string;
      transactionId?: string;
      transactionDate: Date;
    },
    client: DbClient = prisma
  ) {
    return client.savingsTransaction.create({
      data: data as any,
      include: { savingsAccount: true, performedBy: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  async findTransactionsByAccount(savingsAccountId: string, page: number, pageSize: number) {
    const [items, total] = await prisma.$transaction([
      prisma.savingsTransaction.findMany({
        where: { savingsAccountId },
        include: { performedBy: { select: { id: true, firstName: true, lastName: true } } },
        orderBy: { transactionDate: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.savingsTransaction.count({ where: { savingsAccountId } }),
    ]);
    return { items, total, page, pageSize };
  }

  async getSummary() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [totalSavings, activeAccounts, todaysDeposits, todaysWithdrawals] = await Promise.all([
      prisma.savingsAccount.aggregate({ _sum: { balance: true }, where: { status: 'ACTIVE', deletedAt: null } }),
      prisma.savingsAccount.count({ where: { status: 'ACTIVE', deletedAt: null } }),
      prisma.savingsTransaction.aggregate({
        _sum: { amount: true },
        where: { transactionType: 'DEPOSIT', transactionDate: { gte: startOfDay } },
      }),
      prisma.savingsTransaction.aggregate({
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

  async findSequence(entity: string, client: DbClient = prisma) {
    return client.numberSequence.findUnique({ where: { entity } });
  }

  async upsertSequence(
    entity: string,
    defaults: { prefix: string; padding: number; yearBased: boolean },
    client: DbClient = prisma
  ) {
    return client.numberSequence.upsert({
      where: { entity },
      create: { entity, ...defaults, currentNumber: 1 },
      update: { currentNumber: { increment: 1 } },
    });
  }
}