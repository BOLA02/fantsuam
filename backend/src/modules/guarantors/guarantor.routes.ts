// src/modules/guarantors/guarantor.routes.ts
// FULL FILE — migrated to Central Identity SSO
// Public + customer-facing routes untouched. Staff routes now use
// requireIdentity + resolveLocalUser + requirePermission('loan.guarantors.manage')

import { Router } from "express";

import guarantorController from "./guarantor.controller";

import { requireIdentity } from "../../middleware/identity.middleware";
import { resolveLocalUser } from "../../middleware/resolveLocalUser.middleware";
import { requirePermission } from "../../middleware/permission.middleware";
import { validate } from "../../middleware/validate.middleware";
import { authenticateCustomer } from "../../middleware/customer-auth.middleware";
import {
  createGuarantorSchema,
  updateGuarantorSchema,
  idParamSchema,
} from "./guarantor.validation";

import { requireApplicationFee } from "../../middleware/application-fee.middleware";

const router = Router();

router.post(
  "/me",
  authenticateCustomer,
  validate(createGuarantorSchema),
  guarantorController.createForCustomer
);

router.get(
  "/me",
  authenticateCustomer,
  guarantorController.getMine
);
// Public — created as part of the customer/loan application flow
router.post(
  "/",
  requireApplicationFee,
  validate(createGuarantorSchema),
  guarantorController.create
);

// Everything below requires staff SSO authentication
router.use(requireIdentity, resolveLocalUser);

router.get("/", requirePermission("loan.employees.manage"), guarantorController.getAll);
router.get("/:id", requirePermission("loan.employees.manage"), validate(idParamSchema), guarantorController.getById);
router.patch("/:id", requirePermission("loan.employees.manage"), validate(updateGuarantorSchema), guarantorController.update);
router.delete("/:id", requirePermission("loan.employees.manage"), validate(idParamSchema), guarantorController.delete);

export default router;