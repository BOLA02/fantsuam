// src/modules/search/search.repository.ts

import prisma from "../../config/prisma";

const RESULT_LIMIT = 5;

class SearchRepository {
  async searchCustomers(keyword: string) {
    return prisma.customer.findMany({
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

  async searchLoans(keyword: string) {
    return prisma.loan.findMany({
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

  async searchLoanApplications(keyword: string) {
    return prisma.loanApplication.findMany({
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

  async searchUsers(keyword: string) {
    return prisma.user.findMany({
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

  async searchGuarantors(keyword: string) {
    return prisma.guarantor.findMany({
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

  async searchBranches(keyword: string) {
    return prisma.branch.findMany({
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

export default new SearchRepository();