"use strict";
// src/modules/guarantors/guarantor.routes.ts
// FULL FILE — migrated to Central Identity SSO
// Public + customer-facing routes untouched. Staff routes now use
// requireIdentity + resolveLocalUser + requirePermission('loan.guarantors.manage')
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const guarantor_controller_1 = __importDefault(require("./guarantor.controller"));
const identity_middleware_1 = require("../../middleware/identity.middleware");
const resolveLocalUser_middleware_1 = require("../../middleware/resolveLocalUser.middleware");
const permission_middleware_1 = require("../../middleware/permission.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const customer_auth_middleware_1 = require("../../middleware/customer-auth.middleware");
const guarantor_validation_1 = require("./guarantor.validation");
const application_fee_middleware_1 = require("../../middleware/application-fee.middleware");
const router = (0, express_1.Router)();
router.post("/me", customer_auth_middleware_1.authenticateCustomer, (0, validate_middleware_1.validate)(guarantor_validation_1.createGuarantorSchema), guarantor_controller_1.default.createForCustomer);
router.get("/me", customer_auth_middleware_1.authenticateCustomer, guarantor_controller_1.default.getMine);
// Public — created as part of the customer/loan application flow
router.post("/", application_fee_middleware_1.requireApplicationFee, (0, validate_middleware_1.validate)(guarantor_validation_1.createGuarantorSchema), guarantor_controller_1.default.create);
// Everything below requires staff SSO authentication
router.use(identity_middleware_1.requireIdentity, resolveLocalUser_middleware_1.resolveLocalUser);
router.get("/", (0, permission_middleware_1.requirePermission)("loan.employees.manage"), guarantor_controller_1.default.getAll);
router.get("/:id", (0, permission_middleware_1.requirePermission)("loan.employees.manage"), (0, validate_middleware_1.validate)(guarantor_validation_1.idParamSchema), guarantor_controller_1.default.getById);
router.patch("/:id", (0, permission_middleware_1.requirePermission)("loan.employees.manage"), (0, validate_middleware_1.validate)(guarantor_validation_1.updateGuarantorSchema), guarantor_controller_1.default.update);
router.delete("/:id", (0, permission_middleware_1.requirePermission)("loan.employees.manage"), (0, validate_middleware_1.validate)(guarantor_validation_1.idParamSchema), guarantor_controller_1.default.delete);
exports.default = router;
