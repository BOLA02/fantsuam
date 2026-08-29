"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const loan_application_controller_1 = __importDefault(require("./loan-application.controller"));
const customer_auth_middleware_1 = require("../../middleware/customer-auth.middleware");
const identity_middleware_1 = require("../../middleware/identity.middleware");
const permission_middleware_1 = require("../../middleware/permission.middleware");
const resolveLocalUser_middleware_1 = require("../../middleware/resolveLocalUser.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const asyncHandler_1 = require("../../utils/asyncHandler");
const loan_application_validation_1 = require("./loan-application.validation");
const application_fee_middleware_1 = require("../../middleware/application-fee.middleware");
const router = (0, express_1.Router)();
// Customer self-service — untouched, separate auth system
router.post("/me", customer_auth_middleware_1.authenticateCustomer, (0, validate_middleware_1.validate)(loan_application_validation_1.createLoanApplicationForCustomerSchema), loan_application_controller_1.default.createForCustomer);
router.get("/me", customer_auth_middleware_1.authenticateCustomer, loan_application_controller_1.default.getMine);
// Public — customer submits application right after customer creation
router.post("/", application_fee_middleware_1.requireApplicationFee, (0, validate_middleware_1.validate)(loan_application_validation_1.createLoanApplicationSchema), loan_application_controller_1.default.create);
// Everything below requires staff SSO authentication
router.use(identity_middleware_1.requireIdentity, (0, asyncHandler_1.asyncHandler)(resolveLocalUser_middleware_1.resolveLocalUser));
router.get("/", (0, permission_middleware_1.requirePermission)("loan.applications.manage", "loan.applications.view"), loan_application_controller_1.default.getAll);
router.get("/:id", (0, permission_middleware_1.requirePermission)("loan.applications.manage", "loan.applications.view"), (0, validate_middleware_1.validate)(loan_application_validation_1.idParamSchema), loan_application_controller_1.default.getById);
router.patch("/:id", (0, permission_middleware_1.requirePermission)("loan.applications.manage"), (0, validate_middleware_1.validate)(loan_application_validation_1.updateLoanApplicationSchema), loan_application_controller_1.default.update);
router.patch("/:id/assign", (0, permission_middleware_1.requirePermission)("loan.applications.manage"), (0, validate_middleware_1.validate)(loan_application_validation_1.assignOfficerSchema), loan_application_controller_1.default.assignOfficer);
router.patch("/:id/status", (0, permission_middleware_1.requirePermission)("loan.applications.manage"), (0, validate_middleware_1.validate)(loan_application_validation_1.changeStatusSchema), loan_application_controller_1.default.changeStatus);
router.delete("/:id", (0, permission_middleware_1.requirePermission)("loan.applications.manage"), (0, validate_middleware_1.validate)(loan_application_validation_1.idParamSchema), loan_application_controller_1.default.cancel);
router.post("/:id/reviews", (0, permission_middleware_1.requirePermission)("loan.applications.manage"), (0, validate_middleware_1.validate)(loan_application_validation_1.createReviewSchema), loan_application_controller_1.default.addReview);
router.get("/:id/reviews", (0, permission_middleware_1.requirePermission)("loan.applications.manage"), (0, validate_middleware_1.validate)(loan_application_validation_1.idParamSchema), loan_application_controller_1.default.getReviews);
router.get("/:id/status-history", (0, permission_middleware_1.requirePermission)("loan.applications.manage"), (0, validate_middleware_1.validate)(loan_application_validation_1.idParamSchema), loan_application_controller_1.default.getStatusHistory);
exports.default = router;
