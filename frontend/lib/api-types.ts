// lib/api-types.ts
// FULL FILE — UPDATED: LoanProduct repaymentFrequency narrowed to union, added fees/requirements

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface Branch {
  id: string;
  branchCode: string;
  name: string;
}

export interface CustomerAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
}

export interface CustomerEmployment {
  employerName: string;
  occupation: string;
  monthlyIncome: number;
  employerAddress?: string;
  employmentDate?: string;
}

export interface Customer {
  id: string;
  customerNumber: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  phone: string;
  email?: string;
  gender: 'MALE' | 'FEMALE';
  status: 'ACTIVE' | 'INACTIVE';
  branchId?: string;
  branch?: Branch;
  addresses?: CustomerAddress[];
  employments?: CustomerEmployment[];
  dateOfBirth?: string;
  nin?: string;
  bvn?: string;
}

export interface RecentApplication {
  id: string;
  applicationNumber: string;
  customerName: string;
  loanAmount: number;
  status: string;
  createdAt: string;
}

export interface DashboardMetrics {
  pendingApplicationsCount: number;
  approvedLoansCount: number;
  totalOutstandingBalance: number;
  todaysCollectionsSum: number;
  monthlyRevenueSum: number;
  latePaymentsCount: number;
  recentApplications: RecentApplication[];
}

export type RepaymentFrequency = 'DAILY' | 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY';

export interface LoanProductFee {
  id?: string;
  feeName: string;
  amount: number;
  percentage: boolean;
}

export interface LoanProductRequirement {
  id?: string;
  title: string;
  description?: string;
  required: boolean;
}

export interface LoanProduct {
  id: string;
  productCode: string;
  name: string;
  description?: string;
  minimumAmount: number;
  maximumAmount: number;
  interestRate: number;
  processingFee: number;
  penaltyRate: number;
  maximumDuration: number;
  repaymentFrequency: RepaymentFrequency;
  requiresGuarantor: boolean;
  requiresBVN: boolean;
  requiresNIN: boolean;
  isActive: boolean;
  fees?: LoanProductFee[];
  requirements?: LoanProductRequirement[];
}



export type ApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'DOCUMENTS_REQUESTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED';

export interface AssignedOfficer {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  role?: string;
}



export interface Guarantor {
  id: string;
  customerId: string;
  fullName: string;
  relationship: string;
  phone: string;
  email?: string;
  occupation?: string;
  address: string;
}

export interface DocumentRecord {
  id: string;
  fileName: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  fileUrl: string;
  documentType: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  customerId?: string;
  guarantorId?: string;
  applicationId?: string;
  collateralId?: string;
}

export type LoanStatus =
  | 'PENDING_DISBURSEMENT'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'DEFAULTED'
  | 'WRITTEN_OFF'
  | 'CANCELLED';

export interface Loan {
  id: string;
  loanNumber: string;
  applicationId: string;
  customerId: string;
  loanProductId: string;
  principalAmount: number;
  interestRate: number;
  processingFee: number;
  approvedAmount: number;
  disbursedAmount: number;
  totalPayable: number;
  outstandingBalance: number;
  durationMonths: number;
  repaymentFrequency: RepaymentFrequency;
  status: LoanStatus;
  approvalDate?: string | null;
  disbursementDate?: string | null;
  maturityDate?: string | null;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
  // Expected to be included by the API (joined from Customer + next RepaymentSchedule row)
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  nextInstallment?: {
    dueDate: string;
    totalAmount: number;
    status: 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE';
  } | null;
}

export interface StatusHistoryEntry {
  id: string;
  status: ApplicationStatus;
  remarks?: string;
  createdAt: string;
  changedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface LoanApplication {
  id: string;
  applicationNumber: string;
  customerId: string;
  loanProductId: string;
  assignedOfficerId?: string;
  requestedAmount: number;
  purpose: string;
  durationMonths: number;
  status: ApplicationStatus;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
  customer: Customer;
  loanProduct: LoanProduct;
  assignedOfficer?: AssignedOfficer | null;
  documents?: DocumentRecord[];
  statusHistory?: StatusHistoryEntry[];
}