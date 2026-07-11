// src/modules/documents/document.service.ts

import prisma from "../../config/prisma";
import { VerificationStatus } from "@prisma/client";
import { AppError } from "../../utils/AppError";
import documentRepository from "./document.repository";
import {
  UploadDocumentInput,
  ListDocumentFilters,
} from "./document.types";

interface UploadedFile {
  originalname: string;
  filename?: string;
  mimetype: string;
  size: number;
  path: string; // secure_url from CloudinaryStorage
}

class DocumentService {
  async getAll(filters: ListDocumentFilters) {
    return documentRepository.findAll(filters);
  }

  async getById(id: string) {
    const document = await documentRepository.findById(id);

    if (!document) {
      throw new AppError(404, "Document not found");
    }

    return document;
  }

  async upload(
    data: UploadDocumentInput,
    file: UploadedFile,
    uploadedById?: string
  ) {
    if (
      !data.customerId &&
      !data.guarantorId &&
      !data.applicationId &&
      !data.collateralId
    ) {
      throw new AppError(
        400,
        "Document must be linked to a customer, guarantor, application, or collateral"
      );
    }

    if (data.customerId) {
      const customer = await prisma.customer.findFirst({
        where: { id: data.customerId, deletedAt: null },
      });

      if (!customer) {
        throw new AppError(404, "Customer not found");
      }
    }

    if (data.guarantorId) {
      const guarantor = await prisma.guarantor.findUnique({
        where: { id: data.guarantorId },
      });

      if (!guarantor) {
        throw new AppError(404, "Guarantor not found");
      }
    }

    if (data.applicationId) {
      const application = await prisma.loanApplication.findUnique({
        where: { id: data.applicationId },
      });

      if (!application) {
        throw new AppError(404, "Loan application not found");
      }
    }

    return documentRepository.create({
      fileName: file.filename ?? file.originalname,
      originalFileName: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
      fileUrl: file.path,
      documentType: data.documentType,
      customerId: data.customerId,
      guarantorId: data.guarantorId,
      applicationId: data.applicationId,
      collateralId: data.collateralId,
      remarks: data.remarks,
      uploadedById,
    });
  }

  async verify(
    id: string,
    verificationStatus: VerificationStatus,
    remarks?: string
  ) {
    await this.getById(id);

    return documentRepository.updateVerification(
      id,
      verificationStatus,
      remarks
    );
  }

  async delete(id: string) {
    await this.getById(id);

    return documentRepository.delete(id);
  }
}

export default new DocumentService();