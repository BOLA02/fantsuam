// src/modules/loan-applications/loan-application.types.ts

export interface CreateLoanApplicationInput {
  customerId: string;
  loanProductId: string;
  assignedOfficerId?: string;
  requestedAmount: number;
  purpose: string;
  durationMonths: number;
  remarks?: string;
}

export interface UpdateLoanApplicationInput {
  requestedAmount?: number;
  purpose?: string;
  durationMonths?: number;
  remarks?: string;
}

export interface AssignOfficerInput {
  assignedOfficerId: string;
}

export interface ChangeStatusInput {
  status:
    | "SUBMITTED"
    | "UNDER_REVIEW"
    | "DOCUMENTS_REQUESTED"
    | "APPROVED"
    | "REJECTED"
    | "CANCELLED";
  remarks?: string;
}

export interface CreateReviewInput {
  recommendation: string;
  comments?: string;
}

export interface ListApplicationFilters {
  status?: string;
  customerId?: string;
  loanProductId?: string;
  assignedOfficerId?: string;
}