"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/modules/customers/customer.routes.ts
const express_1 = require("express");
const customer_controller_1 = __importDefault(require("./customer.controller"));
const customer_auth_middleware_1 = require("../../middleware/customer-auth.middleware");
const identity_middleware_1 = require("../../middleware/identity.middleware");
const permission_middleware_1 = require("../../middleware/permission.middleware");
const resolveLocalUser_middleware_1 = require("../../middleware/resolveLocalUser.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const asyncHandler_1 = require("../../utils/asyncHandler");
const customer_validation_1 = require("./customer.validation");
const application_fee_middleware_1 = require("../../middleware/application-fee.middleware");
const router = (0, express_1.Router)();
router.get("/me", customer_auth_middleware_1.authenticateCustomer, customer_controller_1.default.getMe);
// Public — customer self-applies for a loan
router.post("/", application_fee_middleware_1.requireApplicationFee, (0, validate_middleware_1.validate)(customer_validation_1.createCustomerSchema), customer_controller_1.default.create);
// Everything below requires staff SSO authentication
router.use(identity_middleware_1.requireIdentity, (0, asyncHandler_1.asyncHandler)(resolveLocalUser_middleware_1.resolveLocalUser));
router.get("/", (0, permission_middleware_1.requirePermission)("loan.customers.manage", "loan.customers.view"), customer_controller_1.default.getAll);
router.get("/search", (0, permission_middleware_1.requirePermission)("loan.customers.manage", "loan.customers.view"), customer_controller_1.default.search);
router.get("/:id", (0, permission_middleware_1.requirePermission)("loan.customers.manage", "loan.customers.view"), customer_controller_1.default.getById);
router.patch("/:id", (0, permission_middleware_1.requirePermission)("loan.customers.manage"), (0, validate_middleware_1.validate)(customer_validation_1.updateCustomerSchema), customer_controller_1.default.update);
// No delete-specific permission in the real scheme — folds into .manage
// like every other mutation on this resource.
router.delete("/:id", (0, permission_middleware_1.requirePermission)("loan.customers.manage"), customer_controller_1.default.delete);
exports.default = router;
