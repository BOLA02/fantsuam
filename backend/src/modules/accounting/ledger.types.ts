import { TransactionType, PaymentMethod } from '@prisma/client';

export interface RecordLedgerEntryInput {
  loanId: string;
  transactionType: TransactionType;
  amount: number;
  direction: 'DEBIT' | 'CREDIT';
  paymentMethod?: PaymentMethod;
  reference?: string;
  narration: string;
  repaymentId?: string;
  penaltyId?: string;
}

export interface LedgerListQuery {
  search?: string;
  loanId?: string;
  page?: number;
  pageSize?: number;
}