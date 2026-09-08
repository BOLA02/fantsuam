"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../../config/prisma"));
class CustomerAccountController {
    loans = async (req, res, next) => {
        try {
            const loans = await prisma_1.default.loan.findMany({
                where: { customerId: req.customer.id, deletedAt: null },
                include: {
                    loanProduct: { select: { name: true, productCode: true } },
                    schedules: { orderBy: { installmentNumber: "asc" } },
                },
                orderBy: { createdAt: "desc" },
            });
            res.json({ success: true, data: loans });
        }
        catch (error) {
            next(error);
        }
    };
    repayments = async (req, res, next) => {
        try {
            const repayments = await prisma_1.default.repayment.findMany({
                where: { loan: { customerId: req.customer.id, deletedAt: null } },
                include: { loan: { select: { loanNumber: true } }, schedule: true },
                orderBy: { paymentDate: "desc" },
            });
            res.json({ success: true, data: repayments });
        }
        catch (error) {
            next(error);
        }
    };
    savings = async (req, res, next) => {
        try {
            const account = await prisma_1.default.savingsAccount.findFirst({
                where: { customerId: req.customer.id, deletedAt: null },
                include: { transactions: { orderBy: { transactionDate: "desc" }, take: 20 } },
            });
            res.json({ success: true, data: account });
        }
        catch (error) {
            next(error);
        }
    };
    eligibility = async (req, res, next) => {
        try {
            const settings = await prisma_1.default.organizationSettings.findFirst();
            const account = await prisma_1.default.savingsAccount.findFirst({ where: { customerId: req.customer.id, deletedAt: null, status: "ACTIVE" }, select: { balance: true } });
            const minimumBalance = Number(settings?.minimumSavingsBalanceForLoan ?? 0);
            const requiresAccount = settings?.loanRequiresSavingsAccount ?? true;
            const eligible = (!requiresAccount || Boolean(account)) && (!account ? minimumBalance === 0 && !requiresAccount : Number(account.balance) >= minimumBalance);
            res.json({ success: true, data: { eligible, requiresAccount, minimumBalance, currentBalance: Number(account?.balance ?? 0) } });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.default = new CustomerAccountController();
