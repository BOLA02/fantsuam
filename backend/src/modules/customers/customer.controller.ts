import { Request, Response, NextFunction } from "express";
import customerService from "./customer.service";

class CustomerController {
  async getAll(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const customers = await customerService.getAll();

      res.status(200).json({
        success: true,
        data: customers,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const customer = await customerService.getById(
        req.params.id as string
      );

      res.status(200).json({
        success: true,
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const customer = await customerService.create(req.body);

      res.status(201).json({
        success: true,
        message: "Customer created successfully",
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const customer = await customerService.update(
        req.params.id as string,
        req.body
      );

      res.status(200).json({
        success: true,
        message: "Customer updated successfully",
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  }

  async search(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const keyword = req.query.q as string;

      const customers = await customerService.search(keyword);

      res.status(200).json({
        success: true,
        data: customers,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      await customerService.delete(req.params.id as string);

      res.status(200).json({
        success: true,
        message: "Customer deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CustomerController();