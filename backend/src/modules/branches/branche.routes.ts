// src/modules/branches/branche.routes.ts
// FULL FILE — migrated to Central Identity SSO
// No branch-specific permission exists in Central Identity's scheme yet.
// Writes were SUPER_ADMIN-only before migration, so using loan.employees.manage
// as a proxy (it's the one permission exclusive to Admin in the real scheme)
// to preserve that boundary rather than opening writes to all staff.
// Replace with a dedicated loan.branches.manage once Central Identity adds one.

import { Router } from "express";

import branchController from "./branche.controller";
import { requireIdentity } from "../../middleware/identity.middleware";
import { resolveLocalUser } from "../../middleware/resolveLocalUser.middleware";
import { requirePermission } from "../../middleware/permission.middleware";
import { validate } from "../../middleware/validate.middleware";
import {
  createBranchSchema,
  updateBranchSchema,
} from "./branche.validation";

const router = Router();

router.use(requireIdentity, resolveLocalUser);

router.get("/", branchController.getAll);

router.get("/:id", branchController.getById);

router.post(
  "/",
  requirePermission("loan.employees.manage"),
  validate(createBranchSchema),
  branchController.create
);

router.patch(
  "/:id",
  requirePermission("loan.employees.manage"),
  validate(updateBranchSchema),
  branchController.update
);

router.delete(
  "/:id",
  requirePermission("loan.employees.manage"),
  branchController.delete
);

export default router;