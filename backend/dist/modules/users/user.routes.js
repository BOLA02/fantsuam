"use strict";
// src/modules/users/user.routes.ts
// FULL FILE — migrated to Central Identity SSO
// loan.employees.manage is Admin-only in the real scheme (Manager does not
// have it) — every route here uses that single permission, no split.
// changePassword stays self-service (auth only) — reconsider whether local
// password change still makes sense once SSO is the sole login path.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = __importDefault(require("./user.controller"));
const identity_middleware_1 = require("../../middleware/identity.middleware");
const resolveLocalUser_middleware_1 = require("../../middleware/resolveLocalUser.middleware");
const permission_middleware_1 = require("../../middleware/permission.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const user_validation_1 = require("./user.validation");
const router = (0, express_1.Router)();
router.use(identity_middleware_1.requireIdentity, resolveLocalUser_middleware_1.resolveLocalUser);
router.get("/", (0, permission_middleware_1.requirePermission)("loan.employees.manage"), user_controller_1.default.getAll);
router.patch("/change-password", (0, validate_middleware_1.validate)(user_validation_1.changePasswordSchema), user_controller_1.default.changePassword);
router.post("/", (0, permission_middleware_1.requirePermission)("loan.employees.manage"), (0, validate_middleware_1.validate)(user_validation_1.createUserSchema), user_controller_1.default.create);
router.get("/:id", (0, permission_middleware_1.requirePermission)("loan.employees.manage"), user_controller_1.default.getById);
router.patch("/:id", (0, permission_middleware_1.requirePermission)("loan.employees.manage"), (0, validate_middleware_1.validate)(user_validation_1.updateUserSchema), user_controller_1.default.update);
router.patch("/:id/reset-password", (0, permission_middleware_1.requirePermission)("loan.employees.manage"), (0, validate_middleware_1.validate)(user_validation_1.resetPasswordSchema), user_controller_1.default.resetPassword);
router.patch("/:id/status", (0, permission_middleware_1.requirePermission)("loan.employees.manage"), user_controller_1.default.changeStatus);
router.delete("/:id", (0, permission_middleware_1.requirePermission)("loan.employees.manage"), user_controller_1.default.delete);
exports.default = router;
