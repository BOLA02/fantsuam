"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// notification.routes.ts
const express_1 = require("express");
const notification_controller_1 = require("./notification.controller");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const asyncHandler_1 = require("../../utils/asyncHandler");
const notification_validation_1 = require("./notification.validation");
const router = (0, express_1.Router)();
const controller = new notification_controller_1.NotificationController();
router.use(auth_middleware_1.authenticate);
router.get('/', (0, validate_middleware_1.validate)(notification_validation_1.listSmsSchema), (0, asyncHandler_1.asyncHandler)(controller.getAllSms));
router.post('/send', (0, validate_middleware_1.validate)(notification_validation_1.sendManualSmsSchema), (0, asyncHandler_1.asyncHandler)(controller.sendManual));
router.get('/templates', (0, asyncHandler_1.asyncHandler)(controller.getTemplates));
exports.default = router;
