"use strict";
// src/modules/documents/document.routes.ts
// FULL FILE — migrated to Central Identity SSO
// Public upload route untouched. Staff routes now use
// requireIdentity + resolveLocalUser + requirePermission('loan.documents.manage')
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const document_controller_1 = __importDefault(require("./document.controller"));
const identity_middleware_1 = require("../../middleware/identity.middleware");
const resolveLocalUser_middleware_1 = require("../../middleware/resolveLocalUser.middleware");
const permission_middleware_1 = require("../../middleware/permission.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const upload_middleware_1 = require("../../middleware/upload.middleware");
const document_validation_1 = require("./document.validation");
const application_fee_middleware_1 = require("../../middleware/application-fee.middleware");
const router = (0, express_1.Router)();
// Public — created as part of the customer/loan application flow
router.post("/", application_fee_middleware_1.requireApplicationFee, upload_middleware_1.upload.single("file"), (0, validate_middleware_1.validate)(document_validation_1.uploadDocumentSchema), document_controller_1.default.upload);
// Everything below requires staff SSO authentication
router.use(identity_middleware_1.requireIdentity, resolveLocalUser_middleware_1.resolveLocalUser);
router.get("/", (0, permission_middleware_1.requirePermission)("loan.documents.manage"), document_controller_1.default.getAll);
router.get("/:id", (0, permission_middleware_1.requirePermission)("loan.documents.manage"), (0, validate_middleware_1.validate)(document_validation_1.idParamSchema), document_controller_1.default.getById);
router.patch("/:id/verify", (0, permission_middleware_1.requirePermission)("loan.documents.manage"), (0, validate_middleware_1.validate)(document_validation_1.verifyDocumentSchema), document_controller_1.default.verify);
router.delete("/:id", (0, permission_middleware_1.requirePermission)("loan.documents.manage"), (0, validate_middleware_1.validate)(document_validation_1.idParamSchema), document_controller_1.default.delete);
exports.default = router;
