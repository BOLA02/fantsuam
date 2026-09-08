import { Request, Response, NextFunction } from "express";
import prisma from "../../config/prisma";

class CustomerAccountController {
  loans = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const loans = await prisma.loan.findMany({
        where: { customerId: req.customer!.id, deletedAt: null },
        include: {
          loanProduct: { select: { name: true, productCode: true } },
          schedules: { orderBy: { installmentNumber: "asc" } },
        },
        orderBy: { createdAt: "desc" },
      });
      res.json({ success: true, data: loans });
    } catch (error) { next(error); }
  };

  repayments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const repayments = await prisma.repayment.findMany({
        where: { loan: { customerId: req.customer!.id, deletedAt: null } },
        include: { loan: { select: { loanNumber: true } }, schedule: true },
        orderBy: { paymentDate: "desc" },
      });
      res.json({ success: true, data: repayments });
    } catch (error) { next(error); }
  };

  savings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const account = await prisma.savingsAccount.findFirst({
        where: { customerId: req.customer!.id, deletedAt: null },
        include: { transactions: { orderBy: { transactionDate: "desc" }, take: 20 } },
      });
      res.json({ success: true, data: account });
    } catch (error) { next(error); }
  };

  eligibility = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const settings = await prisma.organizationSettings.findFirst() as any;
      const account = await prisma.savingsAccount.findFirst({ where: { customerId: req.customer!.id, deletedAt: null, status: "ACTIVE" }, select: { balance: true } });
      const minimumBalance = Number(settings?.minimumSavingsBalanceForLoan ?? 0);
      const requiresAccount = settings?.loanRequiresSavingsAccount ?? true;
      const eligible = (!requiresAccount || Boolean(account)) && (!account ? minimumBalance === 0 && !requiresAccount : Number(account.balance) >= minimumBalance);
      res.json({ success: true, data: { eligible, requiresAccount, minimumBalance, currentBalance: Number(account?.balance ?? 0) } });
    } catch (error) { next(error); }
  };
}
export default new CustomerAccountController();
