"use strict";
// src/modules/guarantors/guarantor.routes.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const guarantor_controller_1 = __importDefault(require("./guarantor.controller"));
const auth_middleware_1 = require("../../middleware/auth.middleware");
const role_middleware_1 = require("../../middleware/role.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const guarantor_validation_1 = require("./guarantor.validation");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
// Public — created as part of the customer/loan application flow
router.post("/", (0, validate_middleware_1.validate)(guarantor_validation_1.createGuarantorSchema), guarantor_controller_1.default.create);
// Everything below requires staff authentication
router.use(auth_middleware_1.authenticate);
router.get("/", (0, role_middleware_1.authorize)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.MANAGER, client_1.UserRole.LOAN_OFFICER, client_1.UserRole.CASHIER), guarantor_controller_1.default.getAll);
router.get("/:id", (0, role_middleware_1.authorize)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.MANAGER, client_1.UserRole.LOAN_OFFICER, client_1.UserRole.CASHIER), (0, validate_middleware_1.validate)(guarantor_validation_1.idParamSchema), guarantor_controller_1.default.getById);
router.patch("/:id", (0, role_middleware_1.authorize)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.MANAGER, client_1.UserRole.LOAN_OFFICER), (0, validate_middleware_1.validate)(guarantor_validation_1.updateGuarantorSchema), guarantor_controller_1.default.update);
router.delete("/:id", (0, role_middleware_1.authorize)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.MANAGER), (0, validate_middleware_1.validate)(guarantor_validation_1.idParamSchema), guarantor_controller_1.default.delete);
exports.default = router;
