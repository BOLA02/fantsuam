import prisma from '../../config/prisma';
import { Prisma } from '@prisma/client';

type DbClient = typeof prisma | Prisma.TransactionClient;

export class LoanRepository {
  private baseInclude = {
    customer: {
      select: { id: true, firstName: true, lastName: true },
    },
    schedules: {
      where: { status: { not: 'PAID' as const } },
      orderBy: { dueDate: 'asc' as const },
      take: 1,
    },
  };

  async findAll(params: { search?: string; status?: string }) {
    const where: Prisma.LoanWhereInput = {
      deletedAt: null,
      ...(params.status ? { status: params.status as any } : {}),
      ...(params.search
        ? {
            customer: {
              OR: [
                { firstName: { contains: params.search } },
                { lastName: { contains: params.search } },
              ],
            },
          }
        : {}),
    };

    return prisma.loan.findMany({
      where,
      include: this.baseInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return prisma.loan.findFirst({
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

  async findByLoanNumber(loanNumber: string, client: DbClient = prisma) {
    return client.loan.findUnique({ where: { loanNumber } });
  }

  /**
   * Creates a Loan row. Pass `client` as the same Prisma transaction client
   * used to flip the source LoanApplication's status, so both writes commit
   * or roll back together.
   */
  async create(
    data: {
      loanNumber: string;
      applicationId: string;
      customerId: string;
      loanProductId: string;
      principalAmount: number;
      interestRate: number;
      processingFee: number;
      approvedAmount: number;
      totalPayable: number;
      outstandingBalance: number;
      durationMonths: number;
      repaymentFrequency: 'DAILY' | 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY';
      approvalDate: Date;
      remarks?: string;
      changedById: string;
    },
    client: DbClient = prisma
  ) {
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

  async disburse(
    loanId: string,
    data: {
      referenceNumber: string;
      amount: number;
      paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'POS' | 'MOBILE_MONEY';
      accountName?: string;
      accountNumber?: string;
      bankName?: string;
      remarks?: string;
      disbursedById: string;
      disbursementDate: Date;
      maturityDate: Date;
      schedules: Array<{
        installmentNumber: number;
        dueDate: Date;
        principalAmount: number;
        interestAmount: number;
        totalAmount: number;
        balance: number;
      }>;
    },
    client: DbClient = prisma
  ) {
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