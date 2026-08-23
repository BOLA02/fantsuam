import { Request, Response } from 'express';
import { SavingsService } from './savings.service';
import { ApiResponse } from '../../utils/apiResponse';

export class SavingsController {
  private service = new SavingsService();

  /**
   * Provision a savings account.
   *
   * This handles both cases:
   * 1. Customer already exists → create savings account for them.
   * 2. Customer does not exist → create customer first, then savings account.
   */
  provisionAccount = async (req: Request, res: Response) => {
    const performedById = (req as any).user.id;

    const result = await this.service.provisionAccount(
      req.body,
      performedById
    );

    return res.status(201).json(
      ApiResponse.success(
        result,
        'Savings account provisioned successfully'
      )
    );
  };

  /**
   * Lookup customer by phone number.
   *
   * This is used by the frontend before submitting
   * the savings account form.
   */
  lookupCustomer = async (req: Request, res: Response) => {
    const phone = String(req.query.phone || '').trim();

    if (!phone) {
      return res.status(400).json(
        ApiResponse.error('Phone number is required')
      );
    }

    const result = await this.service.findCustomerByPhone(phone);

    return res.status(200).json(
      ApiResponse.success(
        result,
        result.exists
          ? 'Customer found'
          : 'Customer not found'
      )
    );
  };

  /**
   * Existing direct account creation.
   *
   * Keep this only if other parts of the system still use it.
   * The new savings flow should use provisionAccount instead.
   */
  createAccount = async (req: Request, res: Response) => {
    const result = await this.service.createAccount(req.body);

    return res.status(201).json(
      ApiResponse.success(
        result,
        'Savings account created'
      )
    );
  };

  deposit = async (req: Request, res: Response) => {
    const performedById = (req as any).user.id;

    const result = await this.service.deposit(
      req.body,
      performedById
    );

    return res.status(201).json(
      ApiResponse.success(
        result,
        'Deposit recorded'
      )
    );
  };

  withdrawal = async (req: Request, res: Response) => {
    const performedById = (req as any).user.id;

    const result = await this.service.withdrawal(
      req.body,
      performedById
    );

    return res.status(201).json(
      ApiResponse.success(
        result,
        'Withdrawal recorded'
      )
    );
  };

  getAccount = async (req: Request, res: Response) => {
    const result = await this.service.getAccount(
      req.params.id as string
    );

    return res.status(200).json(
      ApiResponse.success(
        result,
        'Savings account retrieved'
      )
    );
  };

  getAllAccounts = async (req: Request, res: Response) => {
    const {
      search,
      status,
      page,
      pageSize,
    } = req.query as {
      search?: string;
      status?: any;
      page?: string;
      pageSize?: string;
    };

    const result = await this.service.getAllAccounts({
      search,
      status,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    });

    return res.status(200).json(
      ApiResponse.success(
        result,
        'Savings accounts retrieved'
      )
    );
  };

  getTransactions = async (req: Request, res: Response) => {
    const {
      page,
      pageSize,
    } = req.query as {
      page?: string;
      pageSize?: string;
    };

    const result = await this.service.getTransactions(
      req.params.id as string,
      page ? Number(page) : undefined,
      pageSize ? Number(pageSize) : undefined
    );

    return res.status(200).json(
      ApiResponse.success(
        result,
        'Savings transactions retrieved'
      )
    );
  };

  getSummary = async (_req: Request, res: Response) => {
    const result = await this.service.getSummary();

    return res.status(200).json(
      ApiResponse.success(
        result,
        'Savings summary retrieved'
      )
    );
  };
}