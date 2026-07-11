// src/modules/loan-applications/loan-application.service.ts

import prisma from "../../config/prisma";
import { ApplicationStatus, UserRole } from "@prisma/client";
import { AppError } from "../../utils/AppError";
import loanApplicationRepository from "./loan-application.repository";
import {
  CreateLoanApplicationInput,
  UpdateLoanApplicationInput,
  ListApplicationFilters,
} from "./loan-application.types";

// Allowed forward transitions for application status.
// APPROVED / REJECTED / CANCELLED are terminal states in this module.
const STATUS_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  DRAFT: ["SUBMITTED", "CANCELLED"],
  SUBMITTED: ["UNDER_REVIEW", "CANCELLED"],
  UNDER_REVIEW: [
    "DOCUMENTS_REQUESTED",
    "APPROVED",
    "REJECTED",
    "CANCELLED",
  ],
  DOCUMENTS_REQUESTED: ["UNDER_REVIEW", "CANCELLED"],
  APPROVED: [],
  REJECTED: [],
  CANCELLED: [],
};

class LoanApplicationService {
  private async generateApplicationNumber(): Promise<string> {
    const datePart = new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "");

    // Retry loop to guarantee uniqueness against the @unique constraint
    for (let attempt = 0; attempt < 5; attempt++) {
      const randomPart = Math.floor(100000 + Math.random() * 900000);
      const candidate = `APP-${datePart}-${randomPart}`;

      const existing =
        await loanApplicationRepository.findByApplicationNumber(candidate);

      if (!existing) {
        return candidate;
      }
    }

    throw new AppError(500, "Failed to generate application number");
  }

  async getAll(filters: ListApplicationFilters) {
    return loanApplicationRepository.findAll(filters);
  }

  async getById(id: string) {
    const application = await loanApplicationRepository.findById(id);

    if (!application) {
      throw new AppError(404, "Loan application not found");
    }

    return application;
  }

 // src/modules/loan-applications/loan-application.service.ts
// UPDATED create() method only — rest of file unchanged

  async create(data: CreateLoanApplicationInput, createdById: string) {
    const customer = await prisma.customer.findFirst({
      where: { id: data.customerId, deletedAt: null },
    });

    if (!customer) {
      throw new AppError(404, "Customer not found");
    }

    if (customer.status !== "ACTIVE") {
      throw new AppError(400, "Customer is not active");
    }

    const loanProduct = await prisma.loanProduct.findFirst({
      where: { id: data.loanProductId, deletedAt: null },
    });

    if (!loanProduct) {
      throw new AppError(404, "Loan product not found");
    }

    if (!loanProduct.isActive) {
      throw new AppError(400, "Loan product is not active");
    }

    if (
      Number(data.requestedAmount) < Number(loanProduct.minimumAmount) ||
      Number(data.requestedAmount) > Number(loanProduct.maximumAmount)
    ) {
      throw new AppError(
        400,
        `Requested amount must be between ${loanProduct.minimumAmount} and ${loanProduct.maximumAmount}`
      );
    }

    if (data.durationMonths > loanProduct.maximumDuration) {
      throw new AppError(
        400,
        `Duration must not exceed ${loanProduct.maximumDuration} months`
      );
    }

    if (data.assignedOfficerId) {
      const officer = await prisma.user.findFirst({
        where: {
          id: data.assignedOfficerId,
          deletedAt: null,
        },
      });

      if (!officer) {
        throw new AppError(404, "Assigned officer not found");
      }

      if (officer.status !== "ACTIVE") {
        throw new AppError(400, "Assigned officer is not active");
      }

      if (officer.role !== UserRole.LOAN_OFFICER) {
        throw new AppError(400, "Assigned user must be a Loan Officer");
      }
    }

    const applicationNumber = await this.generateApplicationNumber();

    return loanApplicationRepository.create({
      applicationNumber,
      customerId: data.customerId,
      loanProductId: data.loanProductId,
      assignedOfficerId: data.assignedOfficerId,
      requestedAmount: data.requestedAmount,
      purpose: data.purpose,
      durationMonths: data.durationMonths,
      remarks: data.remarks,
      createdById,
    });
  }

  async update(id: string, data: UpdateLoanApplicationInput) {
    const application = await this.getById(id);

    if (
      application.status !== ApplicationStatus.DRAFT &&
      application.status !== ApplicationStatus.SUBMITTED
    ) {
      throw new AppError(
        400,
        "Only DRAFT or SUBMITTED applications can be edited"
      );
    }

    if (
      data.requestedAmount !== undefined ||
      data.durationMonths !== undefined
    ) {
      const requestedAmount =
        data.requestedAmount ?? Number(application.requestedAmount);
      const durationMonths =
        data.durationMonths ?? application.durationMonths;

      const loanProduct = application.loanProduct;

      if (
        requestedAmount < Number(loanProduct.minimumAmount) ||
        requestedAmount > Number(loanProduct.maximumAmount)
      ) {
        throw new AppError(
          400,
          `Requested amount must be between ${loanProduct.minimumAmount} and ${loanProduct.maximumAmount}`
        );
      }

      if (durationMonths > loanProduct.maximumDuration) {
        throw new AppError(
          400,
          `Duration must not exceed ${loanProduct.maximumDuration} months`
        );
      }
    }

    return loanApplicationRepository.update(id, data);
  }

  async assignOfficer(id: string, assignedOfficerId: string) {
    await this.getById(id);

    const officer = await prisma.user.findFirst({
      where: { id: assignedOfficerId, deletedAt: null },
    });

    if (!officer) {
      throw new AppError(404, "Officer not found");
    }

    if (officer.status !== "ACTIVE") {
      throw new AppError(400, "Officer is not active");
    }

    if (officer.role !== UserRole.LOAN_OFFICER) {
      throw new AppError(400, "Assigned user must be a Loan Officer");
    }

    return loanApplicationRepository.assignOfficer(id, assignedOfficerId);
  }

// src/modules/loan-applications/loan-application.service.ts
// UPDATED — changeStatus() now enforces requiresGuarantor. Rest of file unchanged.

  async changeStatus(
    id: string,
    newStatus: ApplicationStatus,
    changedById: string,
    remarks?: string
  ) {
    const application = await this.getById(id);

    const allowedNext = STATUS_TRANSITIONS[application.status];

    if (!allowedNext.includes(newStatus)) {
      throw new AppError(
        400,
        `Cannot transition application from ${application.status} to ${newStatus}`
      );
    }

    if (
      newStatus === ApplicationStatus.UNDER_REVIEW &&
      application.loanProduct.requiresGuarantor
    ) {
      const guarantorCount = await prisma.guarantor.count({
        where: { customerId: application.customerId },
      });

      if (guarantorCount === 0) {
        throw new AppError(
          400,
          "This loan product requires at least one guarantor before review"
        );
      }
    }

    return loanApplicationRepository.changeStatus(
      id,
      newStatus,
      changedById,
      remarks
    );
  }
  async cancel(id: string, changedById: string, remarks?: string) {
    const application = await this.getById(id);

    if (
      application.status !== ApplicationStatus.DRAFT &&
      application.status !== ApplicationStatus.SUBMITTED
    ) {
      throw new AppError(
        400,
        "Only DRAFT or SUBMITTED applications can be cancelled"
      );
    }

    return this.changeStatus(
      id,
      ApplicationStatus.CANCELLED,
      changedById,
      remarks ?? "Application cancelled"
    );
  }

  async addReview(
    applicationId: string,
    reviewerId: string,
    recommendation: string,
    comments?: string
  ) {
    await this.getById(applicationId);

    return loanApplicationRepository.createReview(
      applicationId,
      reviewerId,
      recommendation,
      comments
    );
  }

  async getReviews(applicationId: string) {
    await this.getById(applicationId);

    return loanApplicationRepository.findReviews(applicationId);
  }

  async getStatusHistory(applicationId: string) {
    await this.getById(applicationId);

    return loanApplicationRepository.findStatusHistory(applicationId);
  }
}

export default new LoanApplicationService();