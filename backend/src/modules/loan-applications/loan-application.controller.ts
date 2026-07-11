// src/modules/loan-applications/loan-application.controller.ts

import { Request, Response, NextFunction } from "express";
import loanApplicationService from "./loan-application.service";
import { ApplicationStatus } from "@prisma/client";
import { getSystemUserId } from "../../config/system-user"; // adjust path if this file lives elsewhere

class LoanApplicationController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const applications = await loanApplicationService.getAll({
        status: req.query.status as string | undefined,
        customerId: req.query.customerId as string | undefined,
        loanProductId: req.query.loanProductId as string | undefined,
        assignedOfficerId: req.query.assignedOfficerId as string | undefined,
      });

      res.status(200).json({
        success: true,
        data: applications,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const application = await loanApplicationService.getById(
        req.params.id as string
      );

      res.status(200).json({
        success: true,
        data: application,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const createdById = req.user?.id ?? (await getSystemUserId());

      const application = await loanApplicationService.create(
        req.body,
        createdById
      );

      res.status(201).json({
        success: true,
        message: "Loan application created successfully",
        data: application,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const application = await loanApplicationService.update(
        req.params.id as string,
        req.body
      );

      res.status(200).json({
        success: true,
        message: "Loan application updated successfully",
        data: application,
      });
    } catch (error) {
      next(error);
    }
  }

  async assignOfficer(req: Request, res: Response, next: NextFunction) {
    try {
      const application = await loanApplicationService.assignOfficer(
        req.params.id as string,
        req.body.assignedOfficerId
      );

      res.status(200).json({
        success: true,
        message: "Officer assigned successfully",
        data: application,
      });
    } catch (error) {
      next(error);
    }
  }

  async changeStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const changedById = req.user!.id;

      const application = await loanApplicationService.changeStatus(
        req.params.id as string,
        req.body.status as ApplicationStatus,
        changedById,
        req.body.remarks
      );

      res.status(200).json({
        success: true,
        message: "Application status updated successfully",
        data: application,
      });
    } catch (error) {
      next(error);
    }
  }

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const changedById = req.user!.id;

      const application = await loanApplicationService.cancel(
        req.params.id as string,
        changedById,
        req.body?.remarks
      );

      res.status(200).json({
        success: true,
        message: "Application cancelled successfully",
        data: application,
      });
    } catch (error) {
      next(error);
    }
  }

  async addReview(req: Request, res: Response, next: NextFunction) {
    try {
      const reviewerId = req.user!.id;

      const review = await loanApplicationService.addReview(
        req.params.id as string,
        reviewerId,
        req.body.recommendation,
        req.body.comments
      );

      res.status(201).json({
        success: true,
        message: "Review added successfully",
        data: review,
      });
    } catch (error) {
      next(error);
    }
  }

  async getReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const reviews = await loanApplicationService.getReviews(
        req.params.id as string
      );

      res.status(200).json({
        success: true,
        data: reviews,
      });
    } catch (error) {
      next(error);
    }
  }

  async getStatusHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const history = await loanApplicationService.getStatusHistory(
        req.params.id as string
      );

      res.status(200).json({
        success: true,
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new LoanApplicationController();