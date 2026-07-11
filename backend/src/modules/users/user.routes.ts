import { Router } from "express";

import userController from "./user.controller";

import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";
import { validate } from "../../middleware/validate.middleware";

import {
  createUserSchema,
  updateUserSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "./user.validation";

import { UserRole } from "@prisma/client";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  authorize(UserRole.SUPER_ADMIN, UserRole.MANAGER),
  userController.getAll
);

router.patch(
  "/change-password",
  validate(changePasswordSchema),
  userController.changePassword
);

router.post(
  "/",
  authorize(UserRole.SUPER_ADMIN),
  validate(createUserSchema),
  userController.create
);

router.get(
  "/:id",
  authorize(UserRole.SUPER_ADMIN, UserRole.MANAGER),
  userController.getById
);

router.patch(
  "/:id",
  authorize(UserRole.SUPER_ADMIN),
  validate(updateUserSchema),
  userController.update
);

router.patch(
  "/:id/reset-password",
  authorize(UserRole.SUPER_ADMIN),
  validate(resetPasswordSchema),
  userController.resetPassword
);

router.patch(
  "/:id/status",
  authorize(UserRole.SUPER_ADMIN),
  userController.changeStatus
);

router.delete(
  "/:id",
  authorize(UserRole.SUPER_ADMIN),
  userController.delete
);

export default router;