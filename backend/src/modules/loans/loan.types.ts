export interface LoanListQuery {
  search?: string;
  status?: string;
}

export interface CreateLoanFromApplicationInput {
  applicationId: string;
  customerId: string;
  loanProductId: string;
  requestedAmount: number;
  interestRate: number;
  processingFee: number;
  durationMonths: number;
  repaymentFrequency: 'DAILY' | 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY';
  remarks?: string;
}

export interface DisburseLoanInput {
  amount: number;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'POS' | 'MOBILE_MONEY';
  accountName?: string;
  accountNumber?: string;
  bankName?: string;
  remarks?: string;
}