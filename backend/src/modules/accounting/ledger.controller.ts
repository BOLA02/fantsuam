// ledger.controller.ts
import { Request, Response } from 'express';
import { LedgerService } from './ledger.service';
import { ApiResponse } from '../../utils/apiResponse';

export class LedgerController {
  private service = new LedgerService();

  getAll = async (req: Request, res: Response) => {
    const { search, loanId, page, pageSize } = req.query as any;
    const result = await this.service.getAll({
      search,
      loanId,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    });
    return res.status(200).json(ApiResponse.success(result, 'Ledger retrieved'));
  };

  getForLoan = async (req: Request, res: Response) => {
    const result = await this.service.getForLoan(req.params.loanId as string);
    return res.status(200).json(ApiResponse.success(result, 'Loan ledger retrieved'));
  };
}