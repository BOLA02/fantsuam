"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = __importDefault(require("./auth.controller"));
const validate_middleware_1 = require("../../middleware/validate.middleware");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const auth_validation_1 = require("./auth.validation");
const identity_middleware_1 = require("../../middleware/identity.middleware");
const resolveLocalUser_middleware_1 = require("../../middleware/resolveLocalUser.middleware");
const asyncHandler_1 = require("../../utils/asyncHandler");
const router = (0, express_1.Router)();
router.post("/login", (0, validate_middleware_1.validate)(auth_validation_1.loginSchema), auth_controller_1.default.login);
router.get("/me", identity_middleware_1.requireIdentity, (0, asyncHandler_1.asyncHandler)(resolveLocalUser_middleware_1.resolveLocalUser), (req, res) => {
    const { firstName, lastName, role, employeeNumber, email } = req.user;
    const { central_role, permissions } = req.identity;
    res.json({
        success: true,
        data: { firstName, lastName, role, employeeNumber, email, central_role, permissions },
    });
});
router.post("/logout", auth_middleware_1.authenticate, auth_controller_1.default.logout);
exports.default = router;
