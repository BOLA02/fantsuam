import { Router } from "express";

import loanApplicationController from "./loan-application.controller";
import { authenticateCustomer } from "../../middleware/customer-auth.middleware";
import { requireIdentity } from "../../middleware/identity.middleware";
import { requirePermission } from "../../middleware/permission.middleware";
import { resolveLocalUser } from "../../middleware/resolveLocalUser.middleware";
import { validate } from "../../middleware/validate.middleware";
import { asyncHandler } from "../../utils/asyncHandler";

import {
  createLoanApplicationSchema,
  createLoanApplicationForCustomerSchema,
  updateLoanApplicationSchema,
  assignOfficerSchema,
  changeStatusSchema,
  createReviewSchema,
  idParamSchema,
} from "./loan-application.validation";

import { requireApplicationFee } from "../../middleware/application-fee.middleware";

const router = Router();

// Customer self-service — untouched, separate auth system
router.post(
  "/me",
  authenticateCustomer,
  validate(createLoanApplicationForCustomerSchema),
  loanApplicationController.createForCustomer
);

router.get(
  "/me",
  authenticateCustomer,
  loanApplicationController.getMine
);

// Public — customer submits application right after customer creation
router.post(
  "/",
  requireApplicationFee,
  validate(createLoanApplicationSchema),
  loanApplicationController.create
);

// Everything below requires staff SSO authentication
router.use(requireIdentity, asyncHandler(resolveLocalUser));

router.get(
  "/",
  requirePermission("loan.applications.manage", "loan.applications.view"),
  loanApplicationController.getAll
);

router.get(
  "/:id",
  requirePermission("loan.applications.manage" , "loan.applications.view"),
  validate(idParamSchema),
  loanApplicationController.getById
);

router.patch(
  "/:id",
  requirePermission("loan.applications.manage"),
  validate(updateLoanApplicationSchema),
  loanApplicationController.update
);


router.patch(
  "/:id/assign",
  requirePermission("loan.applications.manage"),
  validate(assignOfficerSchema),
  loanApplicationController.assignOfficer
);

router.patch(
  "/:id/status",
  requirePermission("loan.applications.manage"),
  validate(changeStatusSchema),
  loanApplicationController.changeStatus
);

router.delete(
  "/:id",
  requirePermission("loan.applications.manage"),
  validate(idParamSchema),
  loanApplicationController.cancel
);

router.post(
  "/:id/reviews",
  requirePermission("loan.applications.manage"),
  validate(createReviewSchema),
  loanApplicationController.addReview
);

router.get(
  "/:id/reviews",
  requirePermission("loan.applications.manage"),
  validate(idParamSchema),
  loanApplicationController.getReviews
);

router.get(
  "/:id/status-history",
  requirePermission("loan.applications.manage"),
  validate(idParamSchema),
  loanApplicationController.getStatusHistory
);

export default router;