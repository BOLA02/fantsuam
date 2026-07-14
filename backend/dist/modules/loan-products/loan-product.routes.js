"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const loan_product_controller_1 = require("./loan-product.controller");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const role_middleware_1 = require("../../middleware/role.middleware");
const asyncHandler_1 = require("../../utils/asyncHandler");
const loan_product_validation_1 = require("./loan-product.validation");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const controller = new loan_product_controller_1.ProductController();
// Public — the apply page's loan-type picker needs to read active products
// before a customer has any auth token at all.
router.get('/', (0, asyncHandler_1.asyncHandler)(controller.getAll));
router.get('/:id', (0, asyncHandler_1.asyncHandler)(controller.getById));
// Everything that creates/modifies/deletes products stays staff-only.
router.use(auth_middleware_1.authenticate);
router.post('/', (0, role_middleware_1.authorize)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.MANAGER), (0, validate_middleware_1.validate)(loan_product_validation_1.createProductSchema), (0, asyncHandler_1.asyncHandler)(controller.create));
router.put('/:id', (0, role_middleware_1.authorize)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.MANAGER), (0, validate_middleware_1.validate)(loan_product_validation_1.updateProductSchema), (0, asyncHandler_1.asyncHandler)(controller.update));
router.patch('/:id/toggle', (0, role_middleware_1.authorize)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.MANAGER), (0, validate_middleware_1.validate)(loan_product_validation_1.toggleProductSchema), (0, asyncHandler_1.asyncHandler)(controller.toggle));
router.delete('/:id', (0, role_middleware_1.authorize)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.MANAGER), (0, asyncHandler_1.asyncHandler)(controller.delete));
exports.default = router;
