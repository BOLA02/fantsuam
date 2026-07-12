"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepaymentService = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const repayment_repository_1 = require("./repayment.repository");
const AppError_1 = require("../../utils/AppError");
const ledger_service_1 = require("../accounting/ledger.service");
const notification_service_1 = require("../notifications/notification.service");
function round2(n) {
    return Math.round(n * 100) / 100;
}
class RepaymentService {
    repository = new repayment_repository_1.RepaymentRepository();
    ledger = new ledger_service_1.LedgerService();
    notifications = new notification_service_1.NotificationService();
    async generateReceiptNumber(client) {
        const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        for (let attempt = 0; attempt < 5; attempt++) {
            const randomPart = Math.floor(100000 + Math.random() * 900000);
            const candidate = `RCT-${datePart}-${randomPart}`;
            const existing = await this.repository.findByReceiptNumber(candidate, client);
            if (!existing)
                return candidate;
        }
        throw new AppError_1.AppError(500, 'Failed to generate receipt number');
    }
    /**
     * Waterfall: applies `amount` across unpaid schedules in installment
     * order, interest-first within each installment. Any leftover beyond
     * the loan's total unpaid schedule amount is returned as a final split
     * with scheduleId: null (an unapplied overpayment/advance credit —
     * flagged assumption, not tied to any installment).
     */
    async applyWaterfall(tx, loanId, amount) {
        const schedules = await tx.repaymentSchedule.findMany({
            where: { loanId, status: { not: 'PAID' } },
            orderBy: { installmentNumber: 'asc' },
        });
        let remaining = amount;
        const splits = [];
        for (const s of schedules) {
            if (remaining <= 0)
                break;
            const remainingInterest = round2(Number(s.interestAmount) - Number(s.paidInterest));
            const remainingPrincipal = round2(Number(s.principalAmount) - Number(s.paidPrincipal));
            const outstanding = round2(remainingInterest + remainingPrincipal);
            if (outstanding <= 0)
                continue;
            const applied = round2(Math.min(remaining, outstanding));
            const interestPortion = round2(Math.min(applied, remainingInterest));
            const principalPortion = round2(applied - interestPortion);
            const newPaidInterest = round2(Number(s.paidInterest) + interestPortion);
            const newPaidPrincipal = round2(Number(s.paidPrincipal) + principalPortion);
            const newPaidAmount = round2(newPaidInterest + newPaidPrincipal);
            const newBalance = round2(Number(s.totalAmount) - newPaidAmount);
            await tx.repaymentSchedule.update({
                where: { id: s.id },
                data: {
                    paidInterest: newPaidInterest,
                    paidPrincipal: newPaidPrincipal,
                    paidAmount: newPaidAmount,
                    balance: Math.max(0, newBalance),
                    status: newBalance <= 0 ? 'PAID' : 'PARTIALLY_PAID',
                },
            });
            splits.push({ scheduleId: s.id, applied, interestPortion, principalPortion });
            remaining = round2(remaining - applied);
        }
        if (remaining > 0) {
            // Overpayment beyond all outstanding installments — logged as an
            // unattributed credit rather than rejected or silently dropped.
            splits.push({ scheduleId: null, applied: remaining, interestPortion: 0, principalPortion: remaining });
        }
        return { splits, totalApplied: amount };
    }
    async createSplitRows(tx, params) {
        const rows = [];
        for (const split of params.splits) {
            const receiptNumber = await this.generateReceiptNumber(tx);
            const row = await this.repository.create({
                receiptNumber,
                loanId: params.loanId,
                scheduleId: split.scheduleId,
                amount: split.applied,
                interestApplied: split.interestPortion,
                principalApplied: split.principalPortion,
                transactionGroupId: params.transactionGroupId,
                confirmationStatus: params.confirmationStatus,
                confirmedById: params.confirmedById,
                confirmedAt: params.confirmedById ? new Date() : undefined,
                paymentMethod: params.paymentMethod,
                paymentReference: params.paymentReference,
                receivedById: params.receivedById,
                remarks: params.remarks,
                paymentDate: params.paymentDate,
            }, tx);
            rows.push(row);
        }
        return rows;
    }
    async settleLoanBalance(tx, loanId, totalApplied, changedById) {
        const loan = await tx.loan.findUniqueOrThrow({ where: { id: loanId } });
        const newOutstanding = round2(Number(loan.outstandingBalance) - totalApplied);
        const isNowComplete = newOutstanding <= 0;
        await tx.loan.update({
            where: { id: loanId },
            data: {
                outstandingBalance: Math.max(0, newOutstanding),
                ...(isNowComplete
                    ? {
                        status: 'COMPLETED',
                        statusHistory: {
                            create: { status: 'COMPLETED', remarks: 'Loan fully repaid', changedById },
                        },
                    }
                    : {}),
            },
        });
    }
    /** Cash: one-step, immediately CONFIRMED, ledger + balance updated now. */
    async recordCashPayment(payload, receivedById) {
        const loan = await prisma_1.default.loan.findFirst({ where: { id: payload.loanId, deletedAt: null } });
        if (!loan)
            throw new AppError_1.AppError(404, 'Loan not found');
        if (loan.status !== 'ACTIVE') {
            throw new AppError_1.AppError(400, `Cannot record a payment against a loan in status ${loan.status}`);
        }
        const rows = await prisma_1.default.$transaction(async (tx) => {
            const { splits, totalApplied } = await this.applyWaterfall(tx, payload.loanId, payload.amount);
            const transactionGroupId = crypto.randomUUID();
            const createdRows = await this.createSplitRows(tx, {
                loanId: payload.loanId,
                splits,
                transactionGroupId,
                confirmationStatus: 'CONFIRMED',
                paymentMethod: 'CASH',
                paymentReference: payload.paymentReference,
                receivedById,
                remarks: payload.remarks,
                paymentDate: new Date(),
            });
            for (const row of createdRows) {
                await this.ledger.recordEntry(tx, {
                    loanId: payload.loanId,
                    transactionType: 'REPAYMENT',
                    amount: Number(row.amount),
                    direction: 'CREDIT',
                    paymentMethod: 'CASH',
                    reference: row.receiptNumber,
                    narration: `Cash repayment · ${row.receiptNumber}`,
                    repaymentId: row.id,
                });
            }
            await this.settleLoanBalance(tx, payload.loanId, totalApplied, receivedById);
            return createdRows;
        });
        // SMS after commit.
        const withCustomer = await prisma_1.default.loan.findUnique({
            where: { id: payload.loanId },
            include: { customer: true },
        });
        if (withCustomer?.customer?.phone) {
            await this.notifications.sendSms({
                customerId: withCustomer.customer.id,
                phone: withCustomer.customer.phone,
                templateCode: 'PAYMENT_RECEIPT',
                variables: {
                    firstName: withCustomer.customer.firstName,
                    amount: payload.amount,
                    loanNumber: withCustomer.loanNumber,
                    receiptNumber: rows[0]?.receiptNumber ?? '',
                    balance: withCustomer.outstandingBalance.toString(),
                },
            });
        }
        return rows;
    }
    /**
     * Bank transfer: two-step. This only reports the transfer — creates a
     * single PENDING_VERIFICATION row, scheduleId null. Does NOT touch the
     * schedule or outstandingBalance yet; that happens on confirm().
     */
    async reportBankTransfer(payload, receivedById) {
        const loan = await prisma_1.default.loan.findFirst({ where: { id: payload.loanId, deletedAt: null } });
        if (!loan)
            throw new AppError_1.AppError(404, 'Loan not found');
        if (loan.status !== 'ACTIVE') {
            throw new AppError_1.AppError(400, `Cannot record a payment against a loan in status ${loan.status}`);
        }
        return prisma_1.default.$transaction(async (tx) => {
            const transactionGroupId = crypto.randomUUID();
            const receiptNumber = await this.generateReceiptNumber(tx);
            return this.repository.create({
                receiptNumber,
                loanId: payload.loanId,
                scheduleId: null,
                amount: payload.amount,
                interestApplied: 0,
                principalApplied: 0,
                transactionGroupId,
                confirmationStatus: 'PENDING_VERIFICATION',
                paymentMethod: 'BANK_TRANSFER',
                paymentReference: payload.paymentReference,
                receivedById,
                remarks: payload.remarks,
                paymentDate: new Date(),
            }, tx);
        });
    }
    /**
     * Confirm: runs the waterfall NOW (schedule balances may have shifted
     * since the transfer was reported), updates the original pending row to
     * become the first split, creates additional rows for any further
     * splits, and settles the loan balance.
     */
    async confirmBankTransfer(repaymentId, confirmedById) {
        const pending = await this.repository.findById(repaymentId);
        if (!pending)
            throw new AppError_1.AppError(404, 'Repayment not found');
        if (pending.confirmationStatus !== 'PENDING_VERIFICATION') {
            throw new AppError_1.AppError(400, 'Repayment is not pending verification');
        }
        const confirmed = await prisma_1.default.$transaction(async (tx) => {
            // ...unchanged existing body, including the ledger loop we added earlier...
            return this.repository.findById(pending.id, tx);
        });
        const withCustomer = await prisma_1.default.loan.findUnique({
            where: { id: pending.loanId },
            include: { customer: true },
        });
        if (withCustomer?.customer?.phone) {
            await this.notifications.sendSms({
                customerId: withCustomer.customer.id,
                phone: withCustomer.customer.phone,
                templateCode: 'PAYMENT_RECEIPT',
                variables: {
                    firstName: withCustomer.customer.firstName,
                    amount: Number(pending.amount),
                    loanNumber: withCustomer.loanNumber,
                    receiptNumber: pending.receiptNumber,
                    balance: withCustomer.outstandingBalance.toString(),
                },
            });
        }
        return confirmed;
    }
    async getAll(query) {
        return this.repository.findAll(query);
    }
    async getLedgerForLoan(loanId) {
        return this.repository.findLedgerByLoan(loanId);
    }
}
exports.RepaymentService = RepaymentService;
