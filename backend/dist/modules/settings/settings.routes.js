"use strict";
// src/modules/settings/settings.routes.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const settings_controller_1 = __importDefault(require("./settings.controller"));
const auth_middleware_1 = require("../../middleware/auth.middleware");
const role_middleware_1 = require("../../middleware/role.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const settings_validation_1 = require("./settings.validation");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get("/organization", settings_controller_1.default.get);
router.patch("/organization", (0, role_middleware_1.authorize)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.MANAGER), (0, validate_middleware_1.validate)(settings_validation_1.updateSettingsSchema), settings_controller_1.default.update);
exports.default = router;
