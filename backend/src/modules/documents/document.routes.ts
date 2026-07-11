// src/modules/documents/document.routes.ts

import { Router } from "express";

import documentController from "./document.controller";

import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";
import { validate } from "../../middleware/validate.middleware";
import { upload } from "../../middleware/upload.middleware";

import {
  uploadDocumentSchema,
  verifyDocumentSchema,
  idParamSchema,
} from "./document.validation";

import { UserRole } from "@prisma/client";

const router = Router();

// Public — created as part of the customer/loan application flow
router.post(
  "/",
  upload.single("file"),
  validate(uploadDocumentSchema),
  documentController.upload
);

// Everything below requires staff authentication
router.use(authenticate);

router.get(
  "/",
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.MANAGER,
    UserRole.LOAN_OFFICER,
    UserRole.CASHIER
  ),
  documentController.getAll
);

router.get(
  "/:id",
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.MANAGER,
    UserRole.LOAN_OFFICER,
    UserRole.CASHIER
  ),
  validate(idParamSchema),
  documentController.getById
);

router.patch(
  "/:id/verify",
  authorize(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.LOAN_OFFICER),
  validate(verifyDocumentSchema),
  documentController.verify
);

router.delete(
  "/:id",
  authorize(UserRole.SUPER_ADMIN, UserRole.MANAGER),
  validate(idParamSchema),
  documentController.delete
);

export default router;