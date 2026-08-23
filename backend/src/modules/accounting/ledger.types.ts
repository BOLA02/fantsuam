import { TransactionType, PaymentMethod } from '@prisma/client';

interface BaseLedgerEntryInput {
  transactionType: TransactionType;
  amount: number;
  direction: 'DEBIT' | 'CREDIT';
  paymentMethod?: PaymentMethod;
  reference?: string;
  narration: string;
}

export interface LoanLedgerEntryInput extends BaseLedgerEntryInput {
  loanId: string;
  repaymentId?: string;
  penaltyId?: string;
  savingsAccountId?: never;
  savingsTransactionId?: never; // Explicitly locked out for loans
}

export interface SavingsLedgerEntryInput extends BaseLedgerEntryInput {
  savingsAccountId: string;       // Required to calculate running balance
  savingsTransactionId: string;   // Required to connect the 1-to-1 schema relation
  loanId?: never;
  repaymentId?: never;
  penaltyId?: never;
}

export type RecordLedgerEntryInput = LoanLedgerEntryInput | SavingsLedgerEntryInput;

export interface LedgerListQuery {
  search?: string;
  loanId?: string;
  savingsAccountId?: string;
  page?: number;
  pageSize?: number;
}
