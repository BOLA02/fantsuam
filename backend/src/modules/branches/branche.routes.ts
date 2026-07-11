import { Router } from "express";

import branchController from "./branche.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";
import { validate } from "../../middleware/validate.middleware";
import {
  createBranchSchema,
  updateBranchSchema,
} from "./branche.validation";

const router = Router();

router.use(authenticate);

router.get("/", branchController.getAll);

router.get("/:id", branchController.getById);

router.post(
  "/",
  authorize("SUPER_ADMIN"),
  validate(createBranchSchema),
  branchController.create
);

router.patch(
  "/:id",
  authorize("SUPER_ADMIN"),
  validate(updateBranchSchema),
  branchController.update
);

router.delete(
  "/:id",
  authorize("SUPER_ADMIN"),
  branchController.delete
);

export default router;