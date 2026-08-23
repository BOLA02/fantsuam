"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LedgerService = void 0;
const ledger_repository_1 = require("./ledger.repository");
class LedgerService {
    repository = new ledger_repository_1.LedgerRepository();
    async recordEntry(tx, input) {
        // 1. Dynamic running balance lookup depending on context
        let lastBalance = 0;
        if (input.loanId) {
            lastBalance = await this.repository.getLastBalanceForLoan(input.loanId, tx);
        }
        else if (input.savingsAccountId) {
            lastBalance = await this.repository.getLastBalanceForSavings(input.savingsAccountId, tx);
        }
        // 2. Compute normal accounting debit/credit values
        const debit = input.direction === 'DEBIT' ? input.amount : 0;
        const credit = input.direction === 'CREDIT' ? input.amount : 0;
        const balance = lastBalance + debit - credit;
        // 3. Persist to database matching the exact relation links
        return this.repository.createEntry({
            loanId: input.loanId,
            repaymentId: input.repaymentId,
            penaltyId: input.penaltyId,
            savingsTransactionId: input.savingsTransactionId, // ✅ FIXED: Passed to match your 1-to-1 schema link
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
    async getForSavings(savingsAccountId) {
        return this.repository.findBySavings(savingsAccountId);
    }
}
exports.LedgerService = LedgerService;
