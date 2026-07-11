import { Request, Response } from 'express';
import { ProductService } from './loan-product.service';
import { ApiResponse } from '../../utils/apiResponse';

export class ProductController {
  private service = new ProductService();

  create = async (req: Request, res: Response) => {
    const result = await this.service.createProduct(req.body);
    return res.status(201).json(ApiResponse.success(result, 'Loan product created successfully'));
  };

  getAll = async (req: Request, res: Response) => {
    const result = await this.service.getAllProducts();
    return res.status(200).json(ApiResponse.success(result, 'Loan products retrieved successfully'));
  };

  getById = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await this.service.getProductById(id);
    return res.status(200).json(ApiResponse.success(result, 'Loan product retrieved successfully'));
  };

  update = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await this.service.updateProduct(id, req.body);
    return res.status(200).json(ApiResponse.success(result, 'Loan product updated successfully'));
  };

  toggle = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await this.service.toggleStatus(id, req.body.isActive);
    const statusText = req.body.isActive ? 'Active' : 'Inactive';
    return res.status(200).json(ApiResponse.success(result, `Product status changed to ${statusText}`));
  };

  delete = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    await this.service.deleteProduct(id);
    return res.status(200).json(ApiResponse.success(null, 'Loan product deleted successfully (soft-deleted)'));
  };
}
