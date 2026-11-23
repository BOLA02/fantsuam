// src/modules/documents/document.service.ts

import prisma from "../../config/prisma";
import { VerificationStatus } from "@prisma/client";
import { AppError } from "../../utils/AppError";
import documentRepository from "./document.repository";
import {
  UploadDocumentInput,
  ListDocumentFilters,
} from "./document.types";
import { documentStorage, parseStorageReference } from "./document.storage";

class DocumentService {
  async getAll(filters: ListDocumentFilters) {
    return (await documentRepository.findAll(filters)).map((document) => this.toResponse(document));
  }

  async getById(id: string) {
    const document = await documentRepository.findById(id);

    if (!document) {
      throw new AppError(404, "Document not found");
    }

    return this.toResponse(document);
  }

  async upload(
    data: UploadDocumentInput,
    file: Express.Multer.File,
    uploadedById?: string,
    verifiedCustomerId?: string
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

    if (!verifiedCustomerId || data.customerId !== verifiedCustomerId) {
      throw new AppError(403, "You cannot upload a document for another customer");
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
      const guarantor = await prisma.guarantor.findFirst({
        where: { id: data.guarantorId, customerId: verifiedCustomerId },
      });

      if (!guarantor) {
        throw new AppError(404, "Guarantor not found");
      }
    }

    if (data.applicationId) {
      const application = await prisma.loanApplication.findFirst({
        where: { id: data.applicationId, customerId: verifiedCustomerId },
      });

      if (!application) {
        throw new AppError(404, "Loan application not found");
      }
    }

    if (data.collateralId) {
      const collateral = await prisma.collateral.findFirst({
        where: { id: data.collateralId, loan: { customerId: verifiedCustomerId } },
      });
      if (!collateral) throw new AppError(404, "Collateral not found");
    }

    let stored;
    try {
      stored = await documentStorage.upload(file);
    } catch {
      throw new AppError(502, "Document storage is unavailable");
    }

    try {
      const document = await documentRepository.create({
        fileName: stored.publicId,
        originalFileName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        fileUrl: stored.storageReference,
        documentType: data.documentType,
        customerId: verifiedCustomerId,
        guarantorId: data.guarantorId,
        applicationId: data.applicationId,
        collateralId: data.collateralId,
        remarks: data.remarks,
        uploadedById,
      });
      return this.toResponse(document);
    } catch (error) {
      try { await documentStorage.delete(stored); } catch { /* retain original persistence error */ }
      throw error;
    }
  }

  async getDownloadSource(id: string) {
    const document = await documentRepository.findById(id);
    if (!document) throw new AppError(404, "Document not found");
    const asset = parseStorageReference(document.fileUrl);
    if (asset) return { kind: "redirect" as const, url: documentStorage.downloadUrl(asset) };
    if (!/^https:\/\//i.test(document.fileUrl)) throw new AppError(404, "Document file is unavailable");
    return { kind: "proxy" as const, url: document.fileUrl, mimeType: document.mimeType, fileName: document.originalFileName };
  }

  private toResponse<T extends { id: string; fileUrl: string }>(document: T) {
    const { fileUrl: _privateStorageLocation, ...safe } = document;
    return { ...safe, downloadPath: `/api/documents/${document.id}/download` };
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
