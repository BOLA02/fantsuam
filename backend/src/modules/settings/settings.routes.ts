// src/modules/settings/settings.routes.ts

import { Router } from "express";

import settingsController from "./settings.controller";

import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";
import { validate } from "../../middleware/validate.middleware";

import { updateSettingsSchema } from "./settings.validation";

import { UserRole } from "@prisma/client";

const router = Router();

router.use(authenticate);

router.get("/organization", settingsController.get);

router.patch(
  "/organization",
  authorize(UserRole.SUPER_ADMIN, UserRole.MANAGER),
  validate(updateSettingsSchema),
  settingsController.update
);

export default router;