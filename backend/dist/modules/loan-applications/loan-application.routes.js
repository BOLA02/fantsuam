"use strict";
// src/modules/loan-applications/loan-application.routes.ts
// FULL FILE — router.use(authenticate) moved below the public POST /
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const loan_application_controller_1 = __importDefault(require("./loan-application.controller"));
const auth_middleware_1 = require("../../middleware/auth.middleware");
const role_middleware_1 = require("../../middleware/role.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const loan_application_validation_1 = require("./loan-application.validation");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
// Public — customer submits application right after customer creation
router.post("/", (0, validate_middleware_1.validate)(loan_application_validation_1.createLoanApplicationSchema), loan_application_controller_1.default.create);
// Everything below requires staff authentication
router.use(auth_middleware_1.authenticate);
router.get("/", (0, role_middleware_1.authorize)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.MANAGER, client_1.UserRole.LOAN_OFFICER, client_1.UserRole.CASHIER), loan_application_controller_1.default.getAll);
router.get("/:id", (0, role_middleware_1.authorize)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.MANAGER, client_1.UserRole.LOAN_OFFICER, client_1.UserRole.CASHIER), (0, validate_middleware_1.validate)(loan_application_validation_1.idParamSchema), loan_application_controller_1.default.getById);
router.patch("/:id", (0, role_middleware_1.authorize)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.MANAGER, client_1.UserRole.LOAN_OFFICER), (0, validate_middleware_1.validate)(loan_application_validation_1.updateLoanApplicationSchema), loan_application_controller_1.default.update);
router.patch("/:id/assign", (0, role_middleware_1.authorize)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.MANAGER), (0, validate_middleware_1.validate)(loan_application_validation_1.assignOfficerSchema), loan_application_controller_1.default.assignOfficer);
router.patch("/:id/status", (0, role_middleware_1.authorize)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.MANAGER, client_1.UserRole.LOAN_OFFICER), (0, validate_middleware_1.validate)(loan_application_validation_1.changeStatusSchema), loan_application_controller_1.default.changeStatus);
router.delete("/:id", (0, role_middleware_1.authorize)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.MANAGER), (0, validate_middleware_1.validate)(loan_application_validation_1.idParamSchema), loan_application_controller_1.default.cancel);
router.post("/:id/reviews", (0, role_middleware_1.authorize)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.MANAGER, client_1.UserRole.LOAN_OFFICER), (0, validate_middleware_1.validate)(loan_application_validation_1.createReviewSchema), loan_application_controller_1.default.addReview);
router.get("/:id/reviews", (0, role_middleware_1.authorize)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.MANAGER, client_1.UserRole.LOAN_OFFICER, client_1.UserRole.CASHIER), (0, validate_middleware_1.validate)(loan_application_validation_1.idParamSchema), loan_application_controller_1.default.getReviews);
router.get("/:id/status-history", (0, role_middleware_1.authorize)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.MANAGER, client_1.UserRole.LOAN_OFFICER, client_1.UserRole.CASHIER), (0, validate_middleware_1.validate)(loan_application_validation_1.idParamSchema), loan_application_controller_1.default.getStatusHistory);
exports.default = router;
