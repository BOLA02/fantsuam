import { Request, Response } from 'express';
import { LoanService } from './loan.service';
import { ApiResponse } from '../../utils/apiResponse';

export class LoanController {
  private service = new LoanService();

  getAll = async (req: Request, res: Response) => {
    const { search, status } = req.query as { search?: string; status?: string };
    const result = await this.service.getAllLoans({ search, status });
    return res.status(200).json(ApiResponse.success(result, 'Loans retrieved successfully'));
  };

  getById = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await this.service.getLoanById(id);
    return res.status(200).json(ApiResponse.success(result, 'Loan retrieved successfully'));
  };

  disburse = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const disbursedById = (req as any).user.id; // set by `authenticate` middleware
    const result = await this.service.disburse(id, req.body, disbursedById);
    return res.status(200).json(ApiResponse.success(result, 'Loan disbursed successfully'));
  };
}