// src/modules/guarantors/guarantor.controller.ts

import { Request, Response, NextFunction } from "express";
import guarantorService from "./guarantor.service";

class GuarantorController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const guarantors = await guarantorService.getAll(
        req.query.customerId as string | undefined
      );

      res.status(200).json({
        success: true,
        data: guarantors,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const guarantor = await guarantorService.getById(
        req.params.id as string
      );

      res.status(200).json({
        success: true,
        data: guarantor,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const guarantor = await guarantorService.create(req.body);

      res.status(201).json({
        success: true,
        message: "Guarantor added successfully",
        data: guarantor,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const guarantor = await guarantorService.update(
        req.params.id as string,
        req.body
      );

      res.status(200).json({
        success: true,
        message: "Guarantor updated successfully",
        data: guarantor,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await guarantorService.delete(req.params.id as string);

      res.status(200).json({
        success: true,
        message: "Guarantor deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new GuarantorController();