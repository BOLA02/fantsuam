import { Request, Response, NextFunction } from "express";
import branchService from "./branche.service";

class BranchController {
  async getAll(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const branches = await branchService.getAll();

      res.status(200).json({
        success: true,
        data: branches,
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
      // 💡 FIX: Force cast the param ID to a string to satisfy the service argument
      const branchId = req.params.id as string;
      const branch = await branchService.getById(branchId);

      res.status(200).json({
        success: true,
        data: branch,
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
      const branch = await branchService.create(req.body);

      res.status(201).json({
        success: true,
        message: "Branch created successfully",
        data: branch,
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
      // 💡 FIX: Force cast the param ID to a string here as well
      const branchId = req.params.id as string;
      const branch = await branchService.update(
        branchId,
        req.body
      );

      res.status(200).json({
        success: true,
        message: "Branch updated successfully",
        data: branch,
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
      // 💡 FIX: Force cast the param ID to a string here too
      const branchId = req.params.id as string;
      await branchService.delete(branchId);

      res.status(200).json({
        success: true,
        message: "Branch deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new BranchController();
