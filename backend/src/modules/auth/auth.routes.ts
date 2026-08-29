import { Router } from "express";

import authController from "./auth.controller";
import { validate } from "../../middleware/validate.middleware";
import { authenticate } from "../../middleware/auth.middleware";
import { loginSchema } from "./auth.validation";
import { requireIdentity } from "../../middleware/identity.middleware";
import { resolveLocalUser } from "../../middleware/resolveLocalUser.middleware";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.post(
  "/login",
  validate(loginSchema),
  authController.login
);

router.get(
  "/me",
  requireIdentity,
  asyncHandler(resolveLocalUser),
  (req, res) => {
    const { firstName, lastName, role, employeeNumber, email } = req.user!;
    const { central_role, permissions } = req.identity!;

    res.json({
      success: true,
      data: { firstName, lastName, role, employeeNumber, email, central_role, permissions },
    });
  }
);

router.post(
  "/logout",
  authenticate,
  authController.logout
);

export default router;