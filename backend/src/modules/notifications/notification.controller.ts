import { Request, Response } from 'express';
import { NotificationService } from './notification.service';
import { ApiResponse } from '../../utils/apiResponse';

export class NotificationController {
  private service = new NotificationService();

  getAllSms = async (req: Request, res: Response) => {
    const { search, status, page, pageSize } = req.query as any;
    const result = await this.service.getAllSms({
      search,
      status,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    });
    return res.status(200).json(ApiResponse.success(result, 'SMS logs retrieved'));
  };

  sendManual = async (req: Request, res: Response) => {
    const { customerId, phone, templateCode, variables } = req.body;
    await this.service.sendSms({ customerId, phone, templateCode, variables: variables ?? {} });
    return res.status(202).json(ApiResponse.success(null, 'SMS queued'));
  };

  getTemplates = async (req: Request, res: Response) => {
    const result = await this.service.getTemplates();
    return res.status(200).json(ApiResponse.success(result, 'Templates retrieved'));
  };
}