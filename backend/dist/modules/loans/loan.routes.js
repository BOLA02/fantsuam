"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const loan_controller_1 = require("./loan.controller");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const role_middleware_1 = require("../../middleware/role.middleware");
const asyncHandler_1 = require("../../utils/asyncHandler");
const loan_validation_1 = require("./loan.validation");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const controller = new loan_controller_1.LoanController();
router.use(auth_middleware_1.authenticate);
router.get('/', (0, validate_middleware_1.validate)(loan_validation_1.listLoansSchema), (0, asyncHandler_1.asyncHandler)(controller.getAll));
router.get('/:id', (0, asyncHandler_1.asyncHandler)(controller.getById));
// ASSUMPTION: disbursement restricted to SUPER_ADMIN, MANAGER, CASHIER —
// not LOAN_OFFICER, since approval and payout are kept as separate controls.
// Change if your actual policy differs.
router.patch('/:id/disburse', (0, role_middleware_1.authorize)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.MANAGER, client_1.UserRole.CASHIER), (0, validate_middleware_1.validate)(loan_validation_1.disburseLoanSchema), (0, asyncHandler_1.asyncHandler)(controller.disburse));
exports.default = router;
