"use strict";
// notification.routes.ts
// FULL FILE — migrated to Central Identity SSO
// No authorize() in the original — any authenticated staff could hit these.
// Preserved as-is: requireIdentity + resolveLocalUser only, no permission gate.
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("./notification.controller");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const identity_middleware_1 = require("../../middleware/identity.middleware");
const resolveLocalUser_middleware_1 = require("../../middleware/resolveLocalUser.middleware");
const asyncHandler_1 = require("../../utils/asyncHandler");
const notification_validation_1 = require("./notification.validation");
const router = (0, express_1.Router)();
const controller = new notification_controller_1.NotificationController();
router.use(identity_middleware_1.requireIdentity, resolveLocalUser_middleware_1.resolveLocalUser);
router.get('/', (0, validate_middleware_1.validate)(notification_validation_1.listSmsSchema), (0, asyncHandler_1.asyncHandler)(controller.getAllSms));
router.post('/send', (0, validate_middleware_1.validate)(notification_validation_1.sendManualSmsSchema), (0, asyncHandler_1.asyncHandler)(controller.sendManual));
router.get('/templates', (0, asyncHandler_1.asyncHandler)(controller.getTemplates));
exports.default = router;
