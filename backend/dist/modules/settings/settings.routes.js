"use strict";
// src/modules/settings/settings.routes.ts
// FULL FILE — migrated to Central Identity SSO
// GET had no authorize() before, stays permission-free (auth only).
// PATCH had authorize(SUPER_ADMIN, MANAGER), now uses requirePermission('loan.settings.manage').
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const settings_controller_1 = __importDefault(require("./settings.controller"));
const identity_middleware_1 = require("../../middleware/identity.middleware");
const resolveLocalUser_middleware_1 = require("../../middleware/resolveLocalUser.middleware");
const permission_middleware_1 = require("../../middleware/permission.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const settings_validation_1 = require("./settings.validation");
const router = (0, express_1.Router)();
router.use(identity_middleware_1.requireIdentity, resolveLocalUser_middleware_1.resolveLocalUser);
router.get("/organization", settings_controller_1.default.get);
router.patch("/organization", (0, permission_middleware_1.requirePermission)("loan.settings.manage"), (0, validate_middleware_1.validate)(settings_validation_1.updateSettingsSchema), settings_controller_1.default.update);
exports.default = router;
