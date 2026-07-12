"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LedgerService = void 0;
const ledger_repository_1 = require("./ledger.repository");
class LedgerService {
    repository = new ledger_repository_1.LedgerRepository();
    /**
     * Must be called with the SAME tx client as the write it's recording
     * (repayment, disbursement, etc.) so the ledger stays consistent with
     * the operation that triggered it.
     */
    async recordEntry(tx, input) {
        const lastBalance = await this.repository.getLastBalance(input.loanId, tx);
        const debit = input.direction === 'DEBIT' ? input.amount : 0;
        const credit = input.direction === 'CREDIT' ? input.amount : 0;
        const balance = lastBalance + debit - credit;
        return this.repository.createEntry({
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
        }, tx);
    }
    async getAll(query) {
        return this.repository.findAll(query);
    }
    async getForLoan(loanId) {
        return this.repository.findByLoan(loanId);
    }
}
exports.LedgerService = LedgerService;
