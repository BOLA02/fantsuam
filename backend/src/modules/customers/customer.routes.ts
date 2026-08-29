// src/modules/customers/customer.routes.ts
import { Router } from "express";

import customerController from "./customer.controller";
import { authenticateCustomer } from "../../middleware/customer-auth.middleware";
import { requireIdentity } from "../../middleware/identity.middleware";
import { requirePermission } from "../../middleware/permission.middleware";
import { resolveLocalUser } from "../../middleware/resolveLocalUser.middleware";
import { validate } from "../../middleware/validate.middleware";
import { asyncHandler } from "../../utils/asyncHandler";

import {
  createCustomerSchema,
  updateCustomerSchema,
} from "./customer.validation";

import { requireApplicationFee } from "../../middleware/application-fee.middleware";

const router = Router();

router.get("/me", authenticateCustomer, customerController.getMe);

// Public — customer self-applies for a loan
router.post(
  "/",
  requireApplicationFee,
  validate(createCustomerSchema),
  customerController.create
);

// Everything below requires staff SSO authentication
router.use(requireIdentity, asyncHandler(resolveLocalUser));

router.get(
  "/",
  requirePermission("loan.customers.manage", "loan.customers.view"),
  customerController.getAll
);

router.get(
  "/search",
  requirePermission("loan.customers.manage", "loan.customers.view"),
  customerController.search
);

router.get(
  "/:id",
  requirePermission("loan.customers.manage", "loan.customers.view"),
  customerController.getById
);

router.patch(
  "/:id",
  requirePermission("loan.customers.manage"),
  validate(updateCustomerSchema),
  customerController.update
);

// No delete-specific permission in the real scheme — folds into .manage
// like every other mutation on this resource.
router.delete(
  "/:id",
  requirePermission("loan.customers.manage"),
  customerController.delete
);

export default router;