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
        req.file,
        uploadedById,
        req.publicCustomerId
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

  async download(req: Request, res: Response, next: NextFunction) {
    try {
      const source = await documentService.getDownloadSource(req.params.id as string);
      if (source.kind === "redirect") return res.redirect(302, source.url);

      const response = await fetch(source.url);
      if (!response.ok || !response.body) throw new AppError(502, "Document storage is unavailable");
      res.setHeader("Content-Type", source.mimeType);
      res.setHeader("Content-Disposition", `attachment; filename*=UTF-8''${encodeURIComponent(source.fileName)}`);
      res.setHeader("Cache-Control", "private, no-store");
      const { Readable } = await import("stream");
      Readable.fromWeb(response.body as any).pipe(res);
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
