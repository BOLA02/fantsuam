// src/modules/documents/document.controller.ts

import { Request, Response, NextFunction } from "express";
import documentService from "./document.service";
import { AppError } from "../../utils/AppError";
import { VerificationStatus } from "@prisma/client";

class DocumentController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const documents = await documentService.getAll({
        customerId: req.query.customerId as string | undefined,
        guarantorId: req.query.guarantorId as string | undefined,
        applicationId: req.query.applicationId as string | undefined,
        collateralId: req.query.collateralId as string | undefined,
        verificationStatus: req.query.verificationStatus as
          | string
          | undefined,
      });

      res.status(200).json({
        success: true,
        data: documents,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const document = await documentService.getById(
        req.params.id as string
      );

      res.status(200).json({
        success: true,
        data: document,
      });
    } catch (error) {
      next(error);
    }
  }

  async upload(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError(400, "No file uploaded");
      }

      const uploadedById = req.user?.id;

      const document = await documentService.upload(
        req.body,
        req.file as any,
        uploadedById
      );

      res.status(201).json({
        success: true,
        message: "Document uploaded successfully",
        data: document,
      });
    } catch (error) {
      next(error);
    }
  }

  async verify(req: Request, res: Response, next: NextFunction) {
    try {
      const document = await documentService.verify(
        req.params.id as string,
        req.body.verificationStatus as VerificationStatus,
        req.body.remarks
      );

      res.status(200).json({
        success: true,
        message: "Document verification updated",
        data: document,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await documentService.delete(req.params.id as string);

      res.status(200).json({
        success: true,
        message: "Document deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new DocumentController();