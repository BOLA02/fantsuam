import { Prisma } from '@prisma/client';
import { LedgerRepository } from './ledger.repository';
import { RecordLedgerEntryInput, LedgerListQuery } from './ledger.types';

export class LedgerService {
  private repository = new LedgerRepository();

  /**
   * Must be called with the SAME tx client as the write it's recording
   * (repayment, disbursement, etc.) so the ledger stays consistent with
   * the operation that triggered it.
   */
  async recordEntry(tx: Prisma.TransactionClient, input: RecordLedgerEntryInput) {
    const lastBalance = await this.repository.getLastBalance(input.loanId, tx);
    const debit = input.direction === 'DEBIT' ? input.amount : 0;
    const credit = input.direction === 'CREDIT' ? input.amount : 0;
    const balance = lastBalance + debit - credit;

    return this.repository.createEntry(
      {
        loanId: input.loanId,
        repaymentId: input.repaymentId,
        penaltyId: input.penaltyId,
        transactionType: input.transactionType,
        amount: input.amount,
        paymentMethod: input.paymentMethod,
        reference: input.reference,
        narration: input.narration,
        debit,
        credit,
        balance,
      },
      tx
    );
  }

  async getAll(query: LedgerListQuery) {
    return this.repository.findAll(query);
  }

  async getForLoan(loanId: string) {
    return this.repository.findByLoan(loanId);
  }
}