"use strict";
// src/modules/branches/branche.routes.ts
// FULL FILE — migrated to Central Identity SSO
// No branch-specific permission exists in Central Identity's scheme yet.
// Writes were SUPER_ADMIN-only before migration, so using loan.employees.manage
// as a proxy (it's the one permission exclusive to Admin in the real scheme)
// to preserve that boundary rather than opening writes to all staff.
// Replace with a dedicated loan.branches.manage once Central Identity adds one.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const branche_controller_1 = __importDefault(require("./branche.controller"));
const identity_middleware_1 = require("../../middleware/identity.middleware");
const resolveLocalUser_middleware_1 = require("../../middleware/resolveLocalUser.middleware");
const permission_middleware_1 = require("../../middleware/permission.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const branche_validation_1 = require("./branche.validation");
const router = (0, express_1.Router)();
router.use(identity_middleware_1.requireIdentity, resolveLocalUser_middleware_1.resolveLocalUser);
router.get("/", branche_controller_1.default.getAll);
router.get("/:id", branche_controller_1.default.getById);
router.post("/", (0, permission_middleware_1.requirePermission)("loan.employees.manage"), (0, validate_middleware_1.validate)(branche_validation_1.createBranchSchema), branche_controller_1.default.create);
router.patch("/:id", (0, permission_middleware_1.requirePermission)("loan.employees.manage"), (0, validate_middleware_1.validate)(branche_validation_1.updateBranchSchema), branche_controller_1.default.update);
router.delete("/:id", (0, permission_middleware_1.requirePermission)("loan.employees.manage"), branche_controller_1.default.delete);
exports.default = router;
