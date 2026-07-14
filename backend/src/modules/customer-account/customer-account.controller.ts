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
}
export default new CustomerAccountController();
