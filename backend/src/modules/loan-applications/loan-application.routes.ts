// src/modules/loan-applications/loan-application.routes.ts
// FULL FILE — router.use(authenticate) moved below the public POST /

import { Router } from "express";

import loanApplicationController from "./loan-application.controller";

import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";
import { validate } from "../../middleware/validate.middleware";

import {
  createLoanApplicationSchema,
  updateLoanApplicationSchema,
  assignOfficerSchema,
  changeStatusSchema,
  createReviewSchema,
  idParamSchema,
} from "./loan-application.validation";

import { UserRole } from "@prisma/client";
import { requireApplicationFee } from "../../middleware/application-fee.middleware";

const router = Router();

// Public — customer submits application right after customer creation
router.post(
  "/",
  requireApplicationFee,
  validate(createLoanApplicationSchema),
  loanApplicationController.create
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
  loanApplicationController.getAll
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
  loanApplicationController.getById
);

router.patch(
  "/:id",
  authorize(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.LOAN_OFFICER),
  validate(updateLoanApplicationSchema),
  loanApplicationController.update
);

router.patch(
  "/:id/assign",
  authorize(UserRole.SUPER_ADMIN, UserRole.MANAGER),
  validate(assignOfficerSchema),
  loanApplicationController.assignOfficer
);

router.patch(
  "/:id/status",
  authorize(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.LOAN_OFFICER),
  validate(changeStatusSchema),
  loanApplicationController.changeStatus
);

router.delete(
  "/:id",
  authorize(UserRole.SUPER_ADMIN, UserRole.MANAGER),
  validate(idParamSchema),
  loanApplicationController.cancel
);

router.post(
  "/:id/reviews",
  authorize(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.LOAN_OFFICER),
  validate(createReviewSchema),
  loanApplicationController.addReview
);

router.get(
  "/:id/reviews",
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.MANAGER,
    UserRole.LOAN_OFFICER,
    UserRole.CASHIER
  ),
  validate(idParamSchema),
  loanApplicationController.getReviews
);

router.get(
  "/:id/status-history",
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.MANAGER,
    UserRole.LOAN_OFFICER,
    UserRole.CASHIER
  ),
  validate(idParamSchema),
  loanApplicationController.getStatusHistory
);

export default router;
