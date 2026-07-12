"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoanService = void 0;
const loan_repository_1 = require("./loan.repository");
const AppError_1 = require("../../utils/AppError");
const prisma_1 = __importDefault(require("../../config/prisma"));
const ledger_service_1 = require("../accounting/ledger.service");
const notification_service_1 = require("../notifications/notification.service");
function toListDto(loan) {
    const nextSchedule = loan.schedules?.[0] ?? null;
    return {
        id: loan.id,
        loanNumber: loan.loanNumber,
        applicationId: loan.applicationId,
        customerId: loan.customerId,
        loanProductId: loan.loanProductId,
        principalAmount: loan.principalAmount,
        interestRate: loan.interestRate,
        processingFee: loan.processingFee,
        approvedAmount: loan.approvedAmount,
        disbursedAmount: loan.disbursedAmount,
        totalPayable: loan.totalPayable,
        outstandingBalance: loan.outstandingBalance,
        durationMonths: loan.durationMonths,
        repaymentFrequency: loan.repaymentFrequency,
        status: loan.status,
        approvalDate: loan.approvalDate,
        disbursementDate: loan.disbursementDate,
        maturityDate: loan.maturityDate,
        remarks: loan.remarks,
        createdAt: loan.createdAt,
        updatedAt: loan.updatedAt,
        customer: loan.customer,
        nextInstallment: nextSchedule
            ? {
                dueDate: nextSchedule.dueDate,
                totalAmount: nextSchedule.totalAmount,
                status: nextSchedule.status,
            }
            : null,
    };
}
// ── Assumptions locked in for this implementation (flag if wrong) ──────────
// - Interest is FLAT: totalInterest = principal * (rate/100) * (durationMonths/12)
// - LoanProductFee rows are NOT folded into totalPayable — only the base
//   LoanProduct.processingFee is used.
// - Installment count per repaymentFrequency (no explicit conversion exists
//   in the schema, so this is an approximation):
//     MONTHLY   -> durationMonths installments, 1 calendar month apart
//     WEEKLY    -> durationMonths * 4 installments, 7 days apart
//     BI_WEEKLY -> durationMonths * 2 installments, 14 days apart
//     DAILY     -> durationMonths * 30 installments, 1 day apart
// - Schedule is generated at disburse() time, dated from disbursementDate —
//   not at approval time.
// - maturityDate = disbursementDate + durationMonths (calendar months).
const INSTALLMENTS_PER_MONTH = {
    MONTHLY: 1,
    WEEKLY: 4,
    BI_WEEKLY: 2,
    DAILY: 30,
};
const DAYS_BETWEEN_INSTALLMENTS = {
    MONTHLY: null, // handled via calendar month addition instead
    WEEKLY: 7,
    BI_WEEKLY: 14,
    DAILY: 1,
};
function round2(n) {
    return Math.round(n * 100) / 100;
}
function addMonths(date, months) {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
}
function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}
class LoanService {
    repository = new loan_repository_1.LoanRepository();
    ledger = new ledger_service_1.LedgerService();
    notifications = new notification_service_1.NotificationService();
    async getAllLoans(query) {
        const loans = await this.repository.findAll(query);
        return loans.map(toListDto);
    }
    async getLoanById(id) {
        const loan = await this.repository.findById(id);
        if (!loan)
            throw new AppError_1.AppError(404, 'Loan not found');
        return loan;
    }
    async generateLoanNumber(client) {
        const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        for (let attempt = 0; attempt < 5; attempt++) {
            const randomPart = Math.floor(100000 + Math.random() * 900000);
            const candidate = `LN-${datePart}-${randomPart}`;
            const existing = await this.repository.findByLoanNumber(candidate, client);
            if (!existing)
                return candidate;
        }
        throw new AppError_1.AppError(500, 'Failed to generate loan number');
    }
    /**
     * Creates a Loan from an APPROVED LoanApplication. `application` must
     * already include its `loanProduct` relation (loan-application.repository's
     * changeStatus/findById both include it). `client` must be the same Prisma
     * transaction client used to flip the application's status.
     */
    async createFromApplication(application, changedById, client) {
        const loanProduct = application.loanProduct;
        if (!loanProduct) {
            throw new AppError_1.AppError(500, 'Application is missing loanProduct relation required to create a loan');
        }
        const principalAmount = Number(application.requestedAmount);
        const interestRate = Number(loanProduct.interestRate);
        const processingFee = Number(loanProduct.processingFee);
        const durationMonths = application.durationMonths;
        const totalInterest = round2(principalAmount * (interestRate / 100) * (durationMonths / 12));
        const totalPayable = round2(principalAmount + totalInterest + processingFee);
        const loanNumber = await this.generateLoanNumber(client);
        return this.repository.create({
            loanNumber,
            applicationId: application.id,
            customerId: application.customerId,
            loanProductId: application.loanProductId,
            principalAmount,
            interestRate,
            processingFee,
            approvedAmount: principalAmount,
            totalPayable,
            outstandingBalance: totalPayable,
            durationMonths,
            repaymentFrequency: loanProduct.repaymentFrequency,
            approvalDate: new Date(),
            remarks: application.remarks ?? undefined,
            changedById,
        }, client);
    }
    /**
     * Disburses a PENDING_DISBURSEMENT loan: records the disbursement, flips
     * status to ACTIVE, sets maturityDate, and generates the full
     * RepaymentSchedule dated from disbursementDate.
     */
    async disburse(loanId, payload, disbursedById) {
        const loan = await this.repository.findById(loanId);
        if (!loan)
            throw new AppError_1.AppError(404, 'Loan not found');
        if (loan.status !== 'PENDING_DISBURSEMENT') {
            throw new AppError_1.AppError(400, `Cannot disburse a loan in status ${loan.status}`);
        }
        if (payload.amount > Number(loan.approvedAmount)) {
            throw new AppError_1.AppError(400, 'Disbursed amount cannot exceed approved amount');
        }
        const disbursementDate = new Date();
        const maturityDate = addMonths(disbursementDate, loan.durationMonths);
        const referenceNumber = this.generateDisbursementReference();
        const schedules = this.buildRepaymentSchedule({
            principalAmount: Number(loan.principalAmount),
            totalPayable: Number(loan.totalPayable),
            durationMonths: loan.durationMonths,
            repaymentFrequency: loan.repaymentFrequency,
            startDate: disbursementDate,
        });
        // 1. Everything financial happens inside the transaction.
        const updated = await prisma_1.default.$transaction(async (tx) => {
            const result = await this.repository.disburse(loanId, {
                referenceNumber,
                amount: payload.amount,
                paymentMethod: payload.paymentMethod,
                accountName: payload.accountName,
                accountNumber: payload.accountNumber,
                bankName: payload.bankName,
                remarks: payload.remarks,
                disbursedById,
                disbursementDate,
                maturityDate,
                schedules,
            }, tx);
            await this.ledger.recordEntry(tx, {
                loanId,
                transactionType: 'LOAN_DISBURSEMENT',
                amount: payload.amount,
                direction: 'DEBIT',
                paymentMethod: payload.paymentMethod,
                reference: referenceNumber,
                narration: `Loan disbursement · ${referenceNumber}`,
            });
            return result;
        });
        // 2. SMS happens AFTER the transaction has committed — outside `tx`,
        // never allowed to roll back a real disbursement if it fails.
        const withCustomer = await this.repository.findById(loanId);
        if (withCustomer?.customer) {
            await this.notifications.sendSms({
                customerId: withCustomer.customer.id,
                phone: withCustomer.customer.phone,
                templateCode: 'LOAN_DISBURSEMENT',
                variables: {
                    firstName: withCustomer.customer.firstName,
                    amount: payload.amount,
                    loanNumber: withCustomer.loanNumber,
                },
            });
        }
        return updated;
    }
    // NOTE: LoanDisbursement.referenceNumber is @unique but no existing lookup
    // method (like findByApplicationNumber) exists for it yet, so there's no
    // collision-retry loop here — add repository.findByReferenceNumber() and a
    // retry loop (matching generateLoanNumber) if collisions turn out to matter.
    generateDisbursementReference() {
        const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomPart = Math.floor(100000 + Math.random() * 900000);
        return `DSB-${datePart}-${randomPart}`;
    }
    buildRepaymentSchedule(params) {
        const { principalAmount, totalPayable, durationMonths, repaymentFrequency, startDate } = params;
        const totalInterest = round2(totalPayable - principalAmount);
        const perMonth = INSTALLMENTS_PER_MONTH[repaymentFrequency];
        if (!perMonth) {
            throw new AppError_1.AppError(500, `Unsupported repaymentFrequency: ${repaymentFrequency}`);
        }
        const count = Math.max(1, Math.round(durationMonths * perMonth));
        const basePrincipal = round2(principalAmount / count);
        const baseInterest = round2(totalInterest / count);
        const baseTotal = round2(totalPayable / count);
        const dayInterval = DAYS_BETWEEN_INSTALLMENTS[repaymentFrequency];
        const schedules = [];
        let runningBalance = totalPayable;
        for (let i = 1; i <= count; i++) {
            const isLast = i === count;
            const dueDate = dayInterval === null ? addMonths(startDate, i) : addDays(startDate, dayInterval * i);
            // Rounding remainder is pushed onto the final installment so the
            // schedule sums exactly to principal / interest / totalPayable.
            const installmentPrincipal = isLast
                ? round2(principalAmount - basePrincipal * (count - 1))
                : basePrincipal;
            const installmentInterest = isLast
                ? round2(totalInterest - baseInterest * (count - 1))
                : baseInterest;
            const installmentTotal = isLast
                ? round2(totalPayable - baseTotal * (count - 1))
                : baseTotal;
            runningBalance = round2(runningBalance - installmentTotal);
            schedules.push({
                installmentNumber: i,
                dueDate,
                principalAmount: installmentPrincipal,
                interestAmount: installmentInterest,
                totalAmount: installmentTotal,
                balance: Math.max(0, runningBalance),
            });
        }
        return schedules;
    }
}
exports.LoanService = LoanService;
