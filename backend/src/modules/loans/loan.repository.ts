import prisma from '../../config/prisma';
import { Prisma } from '@prisma/client';

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
}