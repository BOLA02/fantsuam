// src/modules/guarantors/guarantor.routes.ts

import { Router } from "express";

import guarantorController from "./guarantor.controller";

import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";
import { validate } from "../../middleware/validate.middleware";

import {
  createGuarantorSchema,
  updateGuarantorSchema,
  idParamSchema,
} from "./guarantor.validation";

import { UserRole } from "@prisma/client";
import { requireApplicationFee } from "../../middleware/application-fee.middleware";

const router = Router();

// Public — created as part of the customer/loan application flow
router.post(
  "/",
  requireApplicationFee,
  validate(createGuarantorSchema),
  guarantorController.create
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
  guarantorController.getAll
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
  guarantorController.getById
);

router.patch(
  "/:id",
  authorize(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.LOAN_OFFICER),
  validate(updateGuarantorSchema),
  guarantorController.update
);

router.delete(
  "/:id",
  authorize(UserRole.SUPER_ADMIN, UserRole.MANAGER),
  validate(idParamSchema),
  guarantorController.delete
);

export default router;
