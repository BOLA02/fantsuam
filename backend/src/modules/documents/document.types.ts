// src/modules/documents/document.types.ts

export interface UploadDocumentInput {
  documentType: string;
  customerId?: string;
  guarantorId?: string;
  applicationId?: string;
  collateralId?: string;
  remarks?: string;
}

export interface VerifyDocumentInput {
  verificationStatus: "VERIFIED" | "REJECTED";
  remarks?: string;
}

export interface ListDocumentFilters {
  customerId?: string;
  guarantorId?: string;
  applicationId?: string;
  collateralId?: string;
  verificationStatus?: string;
}