import { Prisma } from '@prisma/client';
import prisma from '../../config/prisma';
import { SavingsRepository } from './savings.repository';
import { AppError } from '../../utils/AppError';
import { LedgerService } from '../accounting/ledger.service';
import { NotificationService } from '../notifications/notification.service';
import CustomerRepository from '../customers/customer.repository';
import {
  CreateSavingsAccountInput,
  DepositInput,
  WithdrawalInput,
  SavingsAccountListQuery,
} from './savings.types';

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

const MAX_RETRIES = 3;

class ConcurrentBalanceUpdateError extends Error {}

export class SavingsService {
  private repository = new SavingsRepository();
  private ledger = new LedgerService();
  private notifications = new NotificationService();

  /** Reserves the next number for an entity via NumberSequence, race-safe under $transaction. */
  private async nextNumber(
    tx: Prisma.TransactionClient,
    entity: string,
    defaults: { prefix: string; padding: number; yearBased: boolean }
  ): Promise<string> {
    const seq = await this.repository.upsertSequence(entity, defaults, tx);
    const padded = String(seq.currentNumber).padStart(seq.padding, '0');
    const year = seq.yearBased ? `${new Date().getFullYear()}-` : '';
    return `${seq.prefix}-${year}${padded}`;
  }

   private async postTransaction(
    input: {
      savingsAccountId: string;
      amount: number;
      paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'POS' | 'MOBILE_MONEY';
      description?: string;
      type: 'DEPOSIT' | 'WITHDRAWAL';
    },
    performedById: string
  ) {
    const amount = round2(input.amount);

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const account = await this.repository.findAccountById(input.savingsAccountId);
      if (!account) throw new AppError(404, 'Savings account not found');
      if (account.status !== 'ACTIVE') {
        throw new AppError(400, `Cannot post a transaction against an account in status ${account.status}`);
      }

      const balanceBefore = Number(account.balance);
      const balanceAfter =
        input.type === 'WITHDRAWAL' ? round2(balanceBefore - amount) : round2(balanceBefore + amount);

      if (input.type === 'WITHDRAWAL' && balanceAfter < 0) {
        throw new AppError(
          400,
          `Insufficient savings balance. Available balance: ${balanceBefore.toLocaleString(undefined, {
            maximumFractionDigits: 2,
          })}`
        );
      }

      try {
        const result = await prisma.$transaction(async (tx) => {
          const updated = await this.repository.updateBalanceConditional(
            account.id,
            account.balance,
            balanceAfter,
            tx
          );
          if (updated.count === 0) throw new ConcurrentBalanceUpdateError();

          const reference = await this.nextNumber(tx, 'SAVINGS_TXN', {
            prefix: 'TXN',
            padding: 6,
            yearBased: true,
          });

          const txnRow = await this.repository.createTransaction(
            {
              reference,
              savingsAccountId: account.id,
              transactionType: input.type,
              amount,
              balanceBefore: account.balance,
              balanceAfter,
              paymentMethod: input.paymentMethod,
              description: input.description,
              performedById,
              transactionDate: new Date(),
            },
            tx
          );

         // inside savings.service.ts -> postTransaction method
await this.ledger.recordEntry(tx, {
  transactionType: input.type === 'WITHDRAWAL' ? 'SAVINGS_WITHDRAWAL' : 'SAVINGS_DEPOSIT',
  amount,
  direction: input.type === 'WITHDRAWAL' ? 'DEBIT' : 'CREDIT',
  paymentMethod: input.paymentMethod,
  reference: txnRow.reference,
  narration: `Savings ${input.type.toLowerCase()} · ${account.accountNumber} · ${txnRow.reference}`,
  savingsAccountId: account.id,         // Used by service to grab the trailing balance
  savingsTransactionId: txnRow.id,     // Used by repository to build the 1-to-1 model relation hook
});


          return txnRow;
        });

        // SMS after commit, same pattern as RepaymentService.
        const customer = account.customer;
        if (customer?.phone) {
          await this.notifications.sendSms({
            customerId: customer.id,
            phone: customer.phone,
            templateCode: input.type === 'WITHDRAWAL' ? 'SAVINGS_WITHDRAWAL' : 'SAVINGS_DEPOSIT',
            variables: {
              firstName: customer.firstName,
              amount: amount.toString(),
              accountNumber: account.accountNumber,
              reference: result.reference,
              balance: balanceAfter.toString(),
            },
          });
        }

        return result;
      } catch (err) {
        if (err instanceof ConcurrentBalanceUpdateError && attempt < MAX_RETRIES - 1) {
          continue;
        }
        if (err instanceof ConcurrentBalanceUpdateError) {
          throw new AppError(409, 'Could not complete transaction due to a concurrent update, please retry');
        }
        throw err;
      }
    }

    throw new AppError(409, 'Could not complete transaction due to a concurrent update, please retry');
  }

  async createAccount(payload: CreateSavingsAccountInput) {
    const customer = await prisma.customer.findFirst({
      where: { id: payload.customerId, deletedAt: null },
    });
    if (!customer) throw new AppError(404, 'Customer not found');

    return prisma.$transaction(async (tx) => {
      const accountNumber = await this.nextNumber(tx, 'SAVINGS_ACCOUNT', {
        prefix: 'SAV',
        padding: 6,
        yearBased: false,
      });

      return this.repository.createAccount(
        { accountNumber, customerId: payload.customerId, branchId: payload.branchId },
        tx
      );
    });
  }

  async deposit(payload: DepositInput, performedById: string) {
    if (round2(payload.amount) <= 0) throw new AppError(400, 'Amount must be greater than 0');
    return this.postTransaction({ ...payload, type: 'DEPOSIT' }, performedById);
  }

  async withdrawal(payload: WithdrawalInput, performedById: string) {
    if (round2(payload.amount) <= 0) throw new AppError(400, 'Amount must be greater than 0');
    return this.postTransaction({ ...payload, type: 'WITHDRAWAL' }, performedById);
  }


  
  async getAccount(id: string) {
    const account = await this.repository.findAccountById(id);
    if (!account) throw new AppError(404, 'Savings account not found');
    return account;
  }

  async getAllAccounts(query: SavingsAccountListQuery) {
    return this.repository.findAllAccounts(query);
  }

  async getTransactions(savingsAccountId: string, page = 1, pageSize = 20) {
    const account = await this.repository.findAccountById(savingsAccountId);
    if (!account) throw new AppError(404, 'Savings account not found');
    return this.repository.findTransactionsByAccount(savingsAccountId, page, pageSize);
  }

  async getSummary() {
    return this.repository.getSummary();
  }

  // savings.service.ts — new method
async provisionAccount(
  input: {
    phone: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    bvn?: string;
    nin?: string;
    branchId?: string;
    initialDeposit: number;
    paymentMethod:
      | 'CASH'
      | 'BANK_TRANSFER'
      | 'POS'
      | 'MOBILE_MONEY';
    description?: string;
  },
  performedById: string
) {
  const initialDeposit = round2(input.initialDeposit);

  if (initialDeposit <= 0) {
    throw new AppError(
      400,
      'Initial deposit must be greater than 0'
    );
  }

  const phone = input.phone.trim();

  if (!phone) {
    throw new AppError(
      400,
      'Customer phone number is required'
    );
  }

  const result = await prisma.$transaction(async (tx) => {

    // --------------------------------------------------
    // 1. FIND CUSTOMER BY PHONE
    // --------------------------------------------------

    let customer = await this.repository.findCustomerByPhone(
      phone,
      tx
    );

    // --------------------------------------------------
    // 2. CREATE CUSTOMER IF NOT FOUND
    // --------------------------------------------------

    if (!customer) {
      if (!input.firstName?.trim() || !input.lastName?.trim()) {
        throw new AppError(
          400,
          'Customer not found. First name and last name are required to create a new customer.'
        );
      }

      const customerNumber = await this.nextNumber(
        tx,
        'CUSTOMER',
        {
          prefix: 'CUS',
          padding: 6,
          yearBased: false,
        }
      );

      customer = await CustomerRepository.create(
        {
          customerNumber,
          phone,

          firstName: input.firstName.trim(),
          lastName: input.lastName.trim(),

          email: input.email?.trim() || undefined,
          bvn: input.bvn?.trim() || undefined,
          nin: input.nin?.trim() || undefined,

          branchId: input.branchId,
        },
        tx
      );
    }

    // --------------------------------------------------
    // 3. CHECK EXISTING SAVINGS ACCOUNT
    // --------------------------------------------------

    const existingAccount =
      await this.repository.findAccountByCustomerId(
        customer.id,
        tx
      );

    if (existingAccount) {
      throw new AppError(
        409,
        `Customer already has savings account ${existingAccount.accountNumber}`
      );
    }

    // --------------------------------------------------
    // 4. CREATE SAVINGS ACCOUNT
    // --------------------------------------------------

    const accountNumber = await this.nextNumber(
      tx,
      'SAVINGS_ACCOUNT',
      {
        prefix: 'SAV',
        padding: 6,
        yearBased: false,
      }
    );

    const account =
      await this.repository.createAccount(
        {
          accountNumber,
          customerId: customer.id,
          branchId:
            input.branchId ??
            customer.branchId ??
            undefined,
        },
        tx
      );

    // --------------------------------------------------
    // 5. CREATE INITIAL DEPOSIT
    // --------------------------------------------------

    const balanceBefore = 0;

    const balanceAfter = initialDeposit;

    // Update account balance
    await this.repository.updateBalanceConditional(
      account.id,
      balanceBefore,
      balanceAfter,
      tx
    );

    // Generate transaction reference
    const reference = await this.nextNumber(
      tx,
      'SAVINGS_TXN',
      {
        prefix: 'TXN',
        padding: 6,
        yearBased: true,
      }
    );

    // Create transaction
    const initialTransaction =
      await this.repository.createTransaction(
        {
          reference,

          savingsAccountId: account.id,

          transactionType: 'DEPOSIT',

          amount: initialDeposit,

          balanceBefore,

          balanceAfter,

          paymentMethod: input.paymentMethod,

          description:
            input.description ??
            'Initial savings deposit',

          performedById,

          transactionDate: new Date(),
        },
        tx
      );

    // --------------------------------------------------
    // 6. LEDGER ENTRY
    // --------------------------------------------------

    await this.ledger.recordEntry(tx, {
      transactionType: 'SAVINGS_DEPOSIT',

      amount: initialDeposit,

      direction: 'CREDIT',

      paymentMethod: input.paymentMethod,

      reference: initialTransaction.reference,

      narration:
        `Initial savings deposit · ${accountNumber} · ${initialTransaction.reference}`,

      savingsAccountId: account.id,

      savingsTransactionId:
        initialTransaction.id,
    });

    return {
      customer,
      account,
      initialTransaction,
    };
  });

  // --------------------------------------------------
  // 7. SEND SMS AFTER TRANSACTION COMMITS
  // --------------------------------------------------

  if (result.customer?.phone) {
    await this.notifications.sendSms({
      customerId: result.customer.id,

      phone: result.customer.phone,

      templateCode: 'SAVINGS_DEPOSIT',

      variables: {
        firstName: result.customer.firstName,

        amount: initialDeposit.toString(),

        accountNumber:
          result.account.accountNumber,

        reference:
          result.initialTransaction.reference,

        balance:
          initialDeposit.toString(),
      },
    });
  }

  // --------------------------------------------------
  // 8. RETURN UPDATED ACCOUNT
  // --------------------------------------------------

  const updatedAccount =
    await this.repository.findAccountById(
      result.account.id
    );

  if (!updatedAccount) {
    throw new AppError(
      404,
      'Savings account could not be retrieved after creation'
    );
  }

  return {
    customer: result.customer,

    account: updatedAccount,

    initialDeposit:
      result.initialTransaction,
  };
}
async findCustomerByPhone(phone: string) {
  const customer = await this.repository.findCustomerByPhone(phone);

  if (!customer) {
    return {
      exists: false,
      customer: null,
      hasSavingsAccount: false,
      savingsAccount: null,
    };
  }

  const existingAccount =
    await this.repository.findAccountByCustomerId(customer.id);

  return {
    exists: true,

    customer: {
      id: customer.id,
      customerNumber: customer.customerNumber,
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      branchId: customer.branchId,
    },

    hasSavingsAccount: !!existingAccount,

    savingsAccount: existingAccount
      ? {
          id: existingAccount.id,
          accountNumber: existingAccount.accountNumber,
          status: existingAccount.status,
        }
      : null,
  };
}
}