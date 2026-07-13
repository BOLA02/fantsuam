// src/modules/search/search.routes.ts

import { Router } from "express";

import searchController from "./search.controller";

import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";

import { UserRole } from "@prisma/client";

const router = Router();

router.use(authenticate);

router.get(
  "/global",
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.MANAGER,
    UserRole.LOAN_OFFICER,
    UserRole.CASHIER
  ),
  searchController.global
);

export default router;