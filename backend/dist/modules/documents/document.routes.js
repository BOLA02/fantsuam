"use strict";
// src/modules/documents/document.routes.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const document_controller_1 = __importDefault(require("./document.controller"));
const auth_middleware_1 = require("../../middleware/auth.middleware");
const role_middleware_1 = require("../../middleware/role.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const upload_middleware_1 = require("../../middleware/upload.middleware");
const document_validation_1 = require("./document.validation");
const client_1 = require("@prisma/client");
const application_fee_middleware_1 = require("../../middleware/application-fee.middleware");
const router = (0, express_1.Router)();
// Public — created as part of the customer/loan application flow
router.post("/", application_fee_middleware_1.requireApplicationFee, upload_middleware_1.upload.single("file"), (0, validate_middleware_1.validate)(document_validation_1.uploadDocumentSchema), document_controller_1.default.upload);
// Everything below requires staff authentication
router.use(auth_middleware_1.authenticate);
router.get("/", (0, role_middleware_1.authorize)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.MANAGER, client_1.UserRole.LOAN_OFFICER, client_1.UserRole.CASHIER), document_controller_1.default.getAll);
router.get("/:id", (0, role_middleware_1.authorize)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.MANAGER, client_1.UserRole.LOAN_OFFICER, client_1.UserRole.CASHIER), (0, validate_middleware_1.validate)(document_validation_1.idParamSchema), document_controller_1.default.getById);
router.patch("/:id/verify", (0, role_middleware_1.authorize)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.MANAGER, client_1.UserRole.LOAN_OFFICER), (0, validate_middleware_1.validate)(document_validation_1.verifyDocumentSchema), document_controller_1.default.verify);
router.delete("/:id", (0, role_middleware_1.authorize)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.MANAGER), (0, validate_middleware_1.validate)(document_validation_1.idParamSchema), document_controller_1.default.delete);
exports.default = router;
