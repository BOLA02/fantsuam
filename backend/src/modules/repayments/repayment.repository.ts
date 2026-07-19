import prisma from '../../config/prisma';
import { Prisma } from '@prisma/client';
import { RepaymentListQuery } from './repayment.types';

type DbClient = typeof prisma | Prisma.TransactionClient;

export class RepaymentRepository {
    
  async findByReceiptNumber(receiptNumber: string, client: DbClient = prisma) {
    return client.repayment.findUnique({ where: { receiptNumber } });
  }

  async findById(id: string, client: DbClient = prisma) {
    return client.repayment.findUnique({
      where: { id },
      include: { loan: true },
    });
  }

  async create(
    data: {
      receiptNumber: string;
      loanId: string;
      scheduleId?: string | null;
      amount: number;
      interestApplied: number;
      principalApplied: number;
      transactionGroupId: string;
      confirmationStatus: 'PENDING_VERIFICATION' | 'CONFIRMED';
      confirmedById?: string;
      confirmedAt?: Date;
      paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'POS' | 'MOBILE_MONEY';
      paymentReference?: string;
      receivedById: string;
      remarks?: string;
      paymentDate: Date;
    },
    client: DbClient = prisma
  ) {
    return client.repayment.create({ data });
  }

  async confirmRow(
    id: string,
    data: {
      confirmationStatus: 'CONFIRMED';
      confirmedById: string;
      confirmedAt: Date;
      scheduleId: string | null;
      interestApplied: number;
      principalApplied: number;
    },
    client: DbClient = prisma
  ) {
    return client.repayment.update({ where: { id }, data });
  }

  async findAll(params: RepaymentListQuery) {
    const where: Prisma.RepaymentWhereInput = {
      ...(params.status ? { confirmationStatus: params.status } : {}),
      ...(params.loanId ? { loanId: params.loanId } : {}),
      ...(params.search
        ? {
            OR: [
              { receiptNumber: { contains: params.search } },
              { loan: { loanNumber: { contains: params.search } } },
              { loan: { customer: { firstName: { contains: params.search } } } },
              { loan: { customer: { lastName: { contains: params.search } } } },
            ],
          }
        : {}),
    };

    return prisma.repayment.findMany({
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

  async findLedgerByLoan(loanId: string) {
    return prisma.repayment.findMany({
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
