// src/modules/customers/customer.routes.ts
// FULL FILE — router.use(authenticate) removed from top, added selectively below

import { Router } from "express";

import customerController from "./customer.controller";

import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";
import { validate } from "../../middleware/validate.middleware";

import {
  createCustomerSchema,
  updateCustomerSchema,
} from "./customer.validation";

import { UserRole } from "@prisma/client";
import { requireApplicationFee } from "../../middleware/application-fee.middleware";

const router = Router();

// Public — customer self-applies for a loan
router.post(
  "/",
  requireApplicationFee,
  validate(createCustomerSchema),
  customerController.create
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
  customerController.getAll
);

router.get(
  "/search",
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.MANAGER,
    UserRole.LOAN_OFFICER,
    UserRole.CASHIER
  ),
  customerController.search
);

router.get(
  "/:id",
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.MANAGER,
    UserRole.LOAN_OFFICER,
    UserRole.CASHIER
  ),
  customerController.getById
);

router.patch(
  "/:id",
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.MANAGER,
    UserRole.LOAN_OFFICER
  ),
  validate(updateCustomerSchema),
  customerController.update
);

router.delete(
  "/:id",
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.MANAGER
  ),
  customerController.delete
);

export default router;
