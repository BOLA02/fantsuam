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
}
exports.default = new CustomerAccountController();
