// src/modules/documents/document.routes.ts
// FULL FILE — migrated to Central Identity SSO
// Public upload route untouched. Staff routes now use
// requireIdentity + resolveLocalUser + requirePermission('loan.documents.manage')

import { Router } from "express";

import documentController from "./document.controller";

import { requireIdentity } from "../../middleware/identity.middleware";
import { resolveLocalUser } from "../../middleware/resolveLocalUser.middleware";
import { requirePermission } from "../../middleware/permission.middleware";
import { validate } from "../../middleware/validate.middleware";
import { upload } from "../../middleware/upload.middleware";

import {
  uploadDocumentSchema,
  verifyDocumentSchema,
  idParamSchema,
} from "./document.validation";

import { requireApplicationFee } from "../../middleware/application-fee.middleware";

const router = Router();

// Public — created as part of the customer/loan application flow
router.post(
  "/",
  requireApplicationFee,
  upload.single("file"),
  validate(uploadDocumentSchema),
  documentController.upload
);

// Everything below requires staff SSO authentication
router.use(requireIdentity, resolveLocalUser);

router.get(
  "/",
  requirePermission("loan.documents.manage"),
  documentController.getAll
);

router.get(
  "/:id",
  requirePermission("loan.documents.manage"),
  validate(idParamSchema),
  documentController.getById
);

router.patch(
  "/:id/verify",
  requirePermission("loan.documents.manage"),
  validate(verifyDocumentSchema),
  documentController.verify
);

router.delete(
  "/:id",
  requirePermission("loan.documents.manage"),
  validate(idParamSchema),
  documentController.delete
);

export default router;