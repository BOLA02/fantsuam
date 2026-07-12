import { Request, Response } from 'express';
import { RepaymentService } from './repayment.service';
import { ApiResponse } from '../../utils/apiResponse';

export class RepaymentController {
  private service = new RepaymentService();

  recordCash = async (req: Request, res: Response) => {
    const receivedById = (req as any).user.id;
    const result = await this.service.recordCashPayment(req.body, receivedById);
    return res.status(201).json(ApiResponse.success(result, 'Cash payment recorded'));
  };

  reportBankTransfer = async (req: Request, res: Response) => {
    const receivedById = (req as any).user.id;
    const result = await this.service.reportBankTransfer(req.body, receivedById);
    return res.status(201).json(ApiResponse.success(result, 'Bank transfer reported, pending verification'));
  };

  confirm = async (req: Request, res: Response) => {
    const confirmedById = (req as any).user.id;
    const result = await this.service.confirmBankTransfer(req.params.id as string, confirmedById);
    return res.status(200).json(ApiResponse.success(result, 'Payment confirmed'));
  };

  getAll = async (req: Request, res: Response) => {
    const { search, status, loanId } = req.query as { search?: string; status?: any; loanId?: string };
    const result = await this.service.getAll({ search, status, loanId });
    return res.status(200).json(ApiResponse.success(result, 'Repayments retrieved'));
  };

  getLedger = async (req: Request, res: Response) => {
    const result = await this.service.getLedgerForLoan(req.params.loanId as string);
    return res.status(200).json(ApiResponse.success(result, 'Ledger retrieved'));
  };
}