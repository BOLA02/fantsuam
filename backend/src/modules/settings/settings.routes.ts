// src/modules/settings/settings.routes.ts
// FULL FILE — migrated to Central Identity SSO
// GET had no authorize() before, stays permission-free (auth only).
// PATCH had authorize(SUPER_ADMIN, MANAGER), now uses requirePermission('loan.settings.manage').

import { Router } from "express";

import settingsController from "./settings.controller";

import { requireIdentity } from "../../middleware/identity.middleware";
import { resolveLocalUser } from "../../middleware/resolveLocalUser.middleware";
import { requirePermission } from "../../middleware/permission.middleware";
import { validate } from "../../middleware/validate.middleware";

import { updateSettingsSchema } from "./settings.validation";

const router = Router();

router.use(requireIdentity, resolveLocalUser);

router.get("/organization", settingsController.get);

router.patch(
  "/organization",
  requirePermission("loan.settings.manage"),
  validate(updateSettingsSchema),
  settingsController.update
);

export default router;