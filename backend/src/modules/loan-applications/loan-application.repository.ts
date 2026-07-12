// src/modules/loan-applications/loan-application.repository.ts

import prisma from "../../config/prisma";

import { ListApplicationFilters } from "./loan-application.types";
import { ApplicationStatus, Prisma } from "@prisma/client";

class LoanApplicationRepository {
  async findAll(filters: ListApplicationFilters) {
    return prisma.loanApplication.findMany({
      where: {
        status: filters.status
          ? (filters.status as ApplicationStatus)
          : undefined,
        customerId: filters.customerId || undefined,
        loanProductId: filters.loanProductId || undefined,
        assignedOfficerId: filters.assignedOfficerId || undefined,
      },
      include: {
        customer: true,
        loanProduct: true,
        assignedOfficer: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findById(id: string) {
    return prisma.loanApplication.findUnique({
      where: { id },
      include: {
        customer: true,
        loanProduct: true,
        assignedOfficer: true,
        documents: true,
        reviews: {
          include: { reviewer: true },
          orderBy: { reviewedAt: "desc" },
        },
        statusHistory: {
          include: { changedBy: true },
          orderBy: { createdAt: "desc" },
        },
        loan: true,
      },
    });
  }

  async findByApplicationNumber(applicationNumber: string) {
    return prisma.loanApplication.findUnique({
      where: { applicationNumber },
    });
  }

 // src/modules/loan-applications/loan-application.repository.ts
// UPDATED create() method only — rest of file unchanged

async create(data: {
    applicationNumber: string;
    customerId: string;
    loanProductId: string;
    assignedOfficerId?: string;
    requestedAmount: number;
    purpose: string;
    durationMonths: number;
    remarks?: string;
    createdById: string;
  }) {
    return prisma.loanApplication.create({
      data: {
        applicationNumber: data.applicationNumber,
        customerId: data.customerId,
        loanProductId: data.loanProductId,
        assignedOfficerId: data.assignedOfficerId,
        requestedAmount: data.requestedAmount,
        purpose: data.purpose,
        durationMonths: data.durationMonths,
        remarks: data.remarks,
        status: ApplicationStatus.SUBMITTED,
        statusHistory: {
          create: {
            status: ApplicationStatus.SUBMITTED,
            remarks: "Application submitted",
            changedById: data.createdById,
          },
        },
      },
      include: {
        customer: true,
        loanProduct: true,
        assignedOfficer: true,
        statusHistory: true,
      },
    });
  }

  async update(id: string, data: Record<string, any>) {
    return prisma.loanApplication.update({
      where: { id },
      data,
      include: {
        customer: true,
        loanProduct: true,
        assignedOfficer: true,
      },
    });
  }

  async assignOfficer(id: string, assignedOfficerId: string) {
    return prisma.loanApplication.update({
      where: { id },
      data: { assignedOfficerId },
      include: {
        customer: true,
        loanProduct: true,
        assignedOfficer: true,
      },
    });
  }

  

  async changeStatus(
    id: string,
    status: ApplicationStatus,
    changedById: string,
    remarks?: string,
    client?: Prisma.TransactionClient
  ) {
    const run = async (tx: Prisma.TransactionClient | typeof prisma) => {
      const application = await tx.loanApplication.update({
        where: { id },
        data: {
          status,
          remarks: remarks ?? undefined,
        },
        include: {
          customer: true,
          loanProduct: true,
          assignedOfficer: true,
        },
      });

      await tx.applicationStatusHistory.create({
        data: {
          applicationId: id,
          status,
          remarks,
          changedById,
        },
      });

      return application;
    };

    if (client) {
      return run(client);
    }

    return prisma.$transaction((tx) => run(tx));
  }

  async createReview(
    applicationId: string,
    reviewerId: string,
    recommendation: string,
    comments?: string
  ) {
    return prisma.applicationReview.create({
      data: {
        applicationId,
        reviewerId,
        recommendation,
        comments,
      },
      include: {
        reviewer: true,
      },
    });
  }

  async findReviews(applicationId: string) {
    return prisma.applicationReview.findMany({
      where: { applicationId },
      include: { reviewer: true },
      orderBy: { reviewedAt: "desc" },
    });
  }

  async findStatusHistory(applicationId: string) {
    return prisma.applicationStatusHistory.findMany({
      where: { applicationId },
      include: { changedBy: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async countByProduct(loanProductId: string) {
    return prisma.loanApplication.count({
      where: { loanProductId },
    });
  }
}

export default new LoanApplicationRepository();