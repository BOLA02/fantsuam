export interface RecordCashPaymentInput {
  loanId: string;
  amount: number;
  paymentReference?: string;
  remarks?: string;
}

export interface ReportBankTransferInput {
  loanId: string;
  amount: number;
  paymentReference?: string;
  remarks?: string;
}

export interface RepaymentListQuery {
  search?: string;
  status?: 'PENDING_VERIFICATION' | 'CONFIRMED';
  loanId?: string;
}