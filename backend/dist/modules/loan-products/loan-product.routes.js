"use strict";
// src/modules/loan-products/loan-product.routes.ts
// FULL FILE — migrated to Central Identity SSO
// GET routes stay fully public (no auth at all — preserved as-is).
// Mutating routes now use requireIdentity + resolveLocalUser + requirePermission('loan.loan-products.manage')
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const loan_product_controller_1 = require("./loan-product.controller");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const identity_middleware_1 = require("../../middleware/identity.middleware");
const resolveLocalUser_middleware_1 = require("../../middleware/resolveLocalUser.middleware");
const permission_middleware_1 = require("../../middleware/permission.middleware");
const asyncHandler_1 = require("../../utils/asyncHandler");
const loan_product_validation_1 = require("./loan-product.validation");
const router = (0, express_1.Router)();
const controller = new loan_product_controller_1.ProductController();
// Public — the apply page's loan-type picker needs to read active products
// before a customer has any auth token at all.
router.get('/', (0, asyncHandler_1.asyncHandler)(controller.getAll));
router.get('/:id', (0, asyncHandler_1.asyncHandler)(controller.getById));
// Everything that creates/modifies/deletes products stays staff-only.
router.use(identity_middleware_1.requireIdentity, resolveLocalUser_middleware_1.resolveLocalUser);
router.post('/', (0, permission_middleware_1.requirePermission)('loan.loan-products.manage'), (0, validate_middleware_1.validate)(loan_product_validation_1.createProductSchema), (0, asyncHandler_1.asyncHandler)(controller.create));
router.put('/:id', (0, permission_middleware_1.requirePermission)('loan.loan-products.manage'), (0, validate_middleware_1.validate)(loan_product_validation_1.updateProductSchema), (0, asyncHandler_1.asyncHandler)(controller.update));
router.patch('/:id/toggle', (0, permission_middleware_1.requirePermission)('loan.loan-products.manage'), (0, validate_middleware_1.validate)(loan_product_validation_1.toggleProductSchema), (0, asyncHandler_1.asyncHandler)(controller.toggle));
router.delete('/:id', (0, permission_middleware_1.requirePermission)('loan.loan-products.manage'), (0, asyncHandler_1.asyncHandler)(controller.delete));
exports.default = router;
