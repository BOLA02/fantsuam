// lib/api-types.ts
// FULL FILE — UPDATED: LoanProduct repaymentFrequency narrowed to union, added fees/requirements
export type RepaymentConfirmationStatus = 'PENDING_VERIFICATION' | 'CONFIRMED';
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

// lib/api-types.ts — UPDATE CustomerAddress and CustomerEmployment, rest of file unchanged

export interface CustomerAddress {
  id: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  isPrimary: boolean;
}

export interface CustomerEmployment {
  id: string;
  employerName: string;
  occupation: string;
  monthlyIncome: number;
  employerAddress?: string;
  employmentDate?: string;
  isCurrent: boolean;
}

// lib/api-types.ts — UPDATE only the Customer interface, rest of file unchanged

export interface Customer {
  id: string;
  customerNumber: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  phone: string;
  email: string | null;
  gender: 'MALE' | 'FEMALE';
  status: 'ACTIVE' | 'INACTIVE';
  branchId?: string;
  branch?: Branch;
  addresses?: CustomerAddress[];
  employments?: CustomerEmployment[];
  dateOfBirth?: string;
  nin?: string;
  bvn?: string;
  createdAt: string;
  updatedAt?: string;
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



export interface RepaymentScheduleEntry {
  id: string;
  installmentNumber: number;
  dueDate: string;
  principalAmount: number;
  interestAmount: number;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  status: 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE';
}

export interface LoanDisbursementRecord {
  id: string;
  referenceNumber: string;
  amount: number;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'POS' | 'MOBILE_MONEY';
  accountName?: string;
  accountNumber?: string;
  bankName?: string;
  remarks?: string;
  disbursedAt: string;
}

export interface RepaymentRecord {
  id: string;
  receiptNumber: string;
  amount: number;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'POS' | 'MOBILE_MONEY';
  paymentReference?: string;
  remarks?: string;
  paymentDate: string;
}

export interface PenaltyRecord {
  id: string;
  amount: number;
  reason: string;
  status: string;
  waived: boolean;
  createdAt: string;
}

export interface LoanStatusHistoryEntry {
  id: string;
  status: LoanStatus;
  remarks?: string;
  createdAt: string;
  changedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

// Extend the existing `Loan` interface with the fields LoanRepository.findById
// includes but LoanRepository.findAll (list view) does not.
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
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
    phone?: string;
    email?: string;
  };
  loanProduct?: {
    id: string;
    name: string;
    productCode: string;
  };
  nextInstallment?: {
    dueDate: string;
    totalAmount: number;
    status: 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE';
  } | null;
  // Present on getById (detail view) only — undefined on list view.
  schedules?: RepaymentScheduleEntry[];
  disbursements?: LoanDisbursementRecord[];
  repayments?: RepaymentRecord[];
  penalties?: PenaltyRecord[];
  statusHistory?: LoanStatusHistoryEntry[];
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




export interface Repayment {
  id: string;
  receiptNumber: string;
  loanId: string;
  scheduleId?: string | null;
  amount: number;
  interestApplied: number;
  principalApplied: number;
  transactionGroupId: string;
  confirmationStatus: RepaymentConfirmationStatus;
  confirmedById?: string | null;
  confirmedAt?: string | null;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'POS' | 'MOBILE_MONEY';
  paymentReference?: string | null;
  receivedById: string;
  remarks?: string | null;
  paymentDate: string;
  createdAt: string;
  loan?: {
    id: string;
    loanNumber: string;
    customer?: {
      id: string;
      firstName: string;
      lastName: string;
    };
  };
  receivedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  confirmedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
}

export type TransactionType =
  | 'LOAN_DISBURSEMENT'
  | 'REPAYMENT'
  | 'INTEREST'
  | 'PENALTY'
  | 'PROCESSING_FEE'
  | 'ADJUSTMENT';

export interface LedgerTransaction {
  id: string;
  transactionNumber: string;
  loanId: string | null;
  transactionType: TransactionType;
  amount: number;
  paymentMethod?: 'CASH' | 'BANK_TRANSFER' | 'POS' | 'MOBILE_MONEY' | null;
  reference?: string | null;
  narration?: string | null;
  transactionDate: string;
  loan?: {
    id: string;
    loanNumber: string;
    customer?: {
      id: string;
      firstName: string;
      lastName: string;
    };
  };
  repayment?: {
    id: string;
    receiptNumber: string;
    receivedBy?: {
      id: string;
      firstName: string;
      lastName: string;
    };
  } | null;
}

export interface LedgerEntry {
  id: string;
  ledgerNumber: string;
  transactionId: string;
  debit: number;
  credit: number;
  balance: number;
  narration: string;
  createdAt: string;
  transaction: LedgerTransaction;
}


export type SmsStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED';

export interface SmsTemplateRef {
  id: string;
  code: string;
  name: string;
  subject?: string | null;
  message: string;
  active: boolean;
}

export interface SmsLog {
  id: string;
  customerId?: string | null;
  phone: string;
  message: string;
  smsStatus: SmsStatus;
  templateId?: string | null;
  providerMessageId?: string | null;
  sentAt?: string | null;
  createdAt: string;
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  template?: SmsTemplateRef | null;
}

export interface SmsTemplateOption {
  id: string;
  code: string;
  name: string;
  message: string;
}