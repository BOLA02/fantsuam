"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const loan_controller_1 = require("./loan.controller");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const identity_middleware_1 = require("../../middleware/identity.middleware");
const permission_middleware_1 = require("../../middleware/permission.middleware");
const resolveLocalUser_middleware_1 = require("../../middleware/resolveLocalUser.middleware");
const asyncHandler_1 = require("../../utils/asyncHandler");
const loan_validation_1 = require("./loan.validation");
const customer_auth_middleware_1 = require("../../middleware/customer-auth.middleware");
const router = (0, express_1.Router)();
const controller = new loan_controller_1.LoanController();
// Customer-facing — untouched, separate auth system entirely
router.get('/me', customer_auth_middleware_1.authenticateCustomer, (0, asyncHandler_1.asyncHandler)(controller.getMine));
// Staff-facing — SSO from here down
router.use(identity_middleware_1.requireIdentity, (0, asyncHandler_1.asyncHandler)(resolveLocalUser_middleware_1.resolveLocalUser));
router.get('/', (0, permission_middleware_1.requirePermission)('loan.loans.manage', 'loan.loans.view'), (0, validate_middleware_1.validate)(loan_validation_1.listLoansSchema), (0, asyncHandler_1.asyncHandler)(controller.getAll));
router.get('/:id', (0, permission_middleware_1.requirePermission)('loan.loans.manage', 'loan.loans.view'), (0, asyncHandler_1.asyncHandler)(controller.getById));
// ASSUMPTION: disbursement restricted to SUPER_ADMIN, MANAGER, CASHIER —
// not LOAN_OFFICER, since approval and payout are kept as separate controls.
// Same granularity problem as repayments/confirm: the spec only has one
// `loan.loans.manage` permission, but disbursement is a more sensitive
// action than viewing a loan. Using a placeholder until Central Identity
// confirms a distinct permission.
router.patch('/:id/disburse', (0, permission_middleware_1.requirePermission)('loan.loans.manage'), (0, validate_middleware_1.validate)(loan_validation_1.disburseLoanSchema), (0, asyncHandler_1.asyncHandler)(controller.disburse));
exports.default = router;
