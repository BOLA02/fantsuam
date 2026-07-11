// src/modules/documents/document.repository.ts

import prisma from "../../config/prisma";
import { VerificationStatus } from "@prisma/client";
import { ListDocumentFilters } from "./document.types";

class DocumentRepository {
  async findAll(filters: ListDocumentFilters) {
    return prisma.document.findMany({
      where: {
        customerId: filters.customerId || undefined,
        guarantorId: filters.guarantorId || undefined,
        applicationId: filters.applicationId || undefined,
        collateralId: filters.collateralId || undefined,
        verificationStatus: filters.verificationStatus
          ? (filters.verificationStatus as VerificationStatus)
          : undefined,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findById(id: string) {
    return prisma.document.findUnique({
      where: { id },
      include: {
        customer: true,
        guarantor: true,
        application: true,
      },
    });
  }

  async create(data: {
    fileName: string;
    originalFileName: string;
    mimeType: string;
    fileSize: number;
    fileUrl: string;
    documentType: string;
    customerId?: string;
    guarantorId?: string;
    applicationId?: string;
    collateralId?: string;
    remarks?: string;
    uploadedById?: string;
  }) {
    return prisma.document.create({
      data: data as any,
    });
  }

  async updateVerification(
    id: string,
    verificationStatus: VerificationStatus,
    remarks?: string
  ) {
    return prisma.document.update({
      where: { id },
      data: {
        verificationStatus,
        remarks,
      },
    });
  }

  async delete(id: string) {
    return prisma.document.delete({
      where: { id },
    });
  }
}

export default new DocumentRepository();