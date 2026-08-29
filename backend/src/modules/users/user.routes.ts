// src/modules/users/user.routes.ts
// FULL FILE — migrated to Central Identity SSO
// loan.employees.manage is Admin-only in the real scheme (Manager does not
// have it) — every route here uses that single permission, no split.
// changePassword stays self-service (auth only) — reconsider whether local
// password change still makes sense once SSO is the sole login path.

import { Router } from "express";

import userController from "./user.controller";

import { requireIdentity } from "../../middleware/identity.middleware";
import { resolveLocalUser } from "../../middleware/resolveLocalUser.middleware";
import { requirePermission } from "../../middleware/permission.middleware";
import { validate } from "../../middleware/validate.middleware";

import {
  createUserSchema,
  updateUserSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "./user.validation";

const router = Router();

router.use(requireIdentity, resolveLocalUser);

router.get(
  "/",
  requirePermission("loan.employees.manage"),
  userController.getAll
);

router.patch(
  "/change-password",
  validate(changePasswordSchema),
  userController.changePassword
);

router.post(
  "/",
  requirePermission("loan.employees.manage"),
  validate(createUserSchema),
  userController.create
);

router.get(
  "/:id",
  requirePermission("loan.employees.manage"),
  userController.getById
);

router.patch(
  "/:id",
  requirePermission("loan.employees.manage"),
  validate(updateUserSchema),
  userController.update
);

router.patch(
  "/:id/reset-password",
  requirePermission("loan.employees.manage"),
  validate(resetPasswordSchema),
  userController.resetPassword
);

router.patch(
  "/:id/status",
  requirePermission("loan.employees.manage"),
  userController.changeStatus
);

router.delete(
  "/:id",
  requirePermission("loan.employees.manage"),
  userController.delete
);

export default router;