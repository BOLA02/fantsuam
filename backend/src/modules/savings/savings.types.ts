export interface CreateSavingsAccountInput {
  customerId: string;
  branchId?: string;
}

export interface DepositInput {
  savingsAccountId: string;
  amount: number;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'POS' | 'MOBILE_MONEY';
  description?: string;
}

export interface WithdrawalInput {
  savingsAccountId: string;
  amount: number;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'POS' | 'MOBILE_MONEY';
  description?: string;
}

export interface SavingsAccountListQuery {
  search?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'CLOSED';
  page?: number;
  pageSize?: number;
}

export interface SavingsTransactionListQuery {
  page?: number;
  pageSize?: number;
}