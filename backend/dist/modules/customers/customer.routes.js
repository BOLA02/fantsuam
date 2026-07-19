"use strict";
// src/modules/customers/customer.routes.ts
// FULL FILE — router.use(authenticate) removed from top, added selectively below
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customer_controller_1 = __importDefault(require("./customer.controller"));
const auth_middleware_1 = require("../../middleware/auth.middleware");
const role_middleware_1 = require("../../middleware/role.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const customer_validation_1 = require("./customer.validation");
const client_1 = require("@prisma/client");
const application_fee_middleware_1 = require("../../middleware/application-fee.middleware");
const router = (0, express_1.Router)();
// Public — customer self-applies for a loan
router.post("/", application_fee_middleware_1.requireApplicationFee, (0, validate_middleware_1.validate)(customer_validation_1.createCustomerSchema), customer_controller_1.default.create);
// Everything below requires staff authentication
router.use(auth_middleware_1.authenticate);
router.get("/", (0, role_middleware_1.authorize)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.MANAGER, client_1.UserRole.LOAN_OFFICER, client_1.UserRole.CASHIER), customer_controller_1.default.getAll);
router.get("/search", (0, role_middleware_1.authorize)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.MANAGER, client_1.UserRole.LOAN_OFFICER, client_1.UserRole.CASHIER), customer_controller_1.default.search);
router.get("/:id", (0, role_middleware_1.authorize)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.MANAGER, client_1.UserRole.LOAN_OFFICER, client_1.UserRole.CASHIER), customer_controller_1.default.getById);
router.patch("/:id", (0, role_middleware_1.authorize)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.MANAGER, client_1.UserRole.LOAN_OFFICER), (0, validate_middleware_1.validate)(customer_validation_1.updateCustomerSchema), customer_controller_1.default.update);
router.delete("/:id", (0, role_middleware_1.authorize)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.MANAGER), customer_controller_1.default.delete);
exports.default = router;
