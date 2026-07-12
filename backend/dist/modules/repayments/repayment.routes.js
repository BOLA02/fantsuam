"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const repayment_controller_1 = require("./repayment.controller");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const role_middleware_1 = require("../../middleware/role.middleware");
const asyncHandler_1 = require("../../utils/asyncHandler");
const repayment_validation_1 = require("./repayment.validation");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const controller = new repayment_controller_1.RepaymentController();
router.use(auth_middleware_1.authenticate);
router.get('/', (0, validate_middleware_1.validate)(repayment_validation_1.listRepaymentsSchema), (0, asyncHandler_1.asyncHandler)(controller.getAll));
router.get('/ledger/:loanId', (0, validate_middleware_1.validate)(repayment_validation_1.ledgerParamSchema), (0, asyncHandler_1.asyncHandler)(controller.getLedger));
router.post('/cash', (0, role_middleware_1.authorize)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.MANAGER, client_1.UserRole.CASHIER, client_1.UserRole.LOAN_OFFICER), (0, validate_middleware_1.validate)(repayment_validation_1.recordCashPaymentSchema), (0, asyncHandler_1.asyncHandler)(controller.recordCash));
router.post('/bank-transfer', (0, role_middleware_1.authorize)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.MANAGER, client_1.UserRole.CASHIER, client_1.UserRole.LOAN_OFFICER), (0, validate_middleware_1.validate)(repayment_validation_1.reportBankTransferSchema), (0, asyncHandler_1.asyncHandler)(controller.reportBankTransfer));
// ASSUMPTION: only admins/managers confirm — not the officer who reported
// it, to keep the two-step verification meaningful.
router.patch('/:id/confirm', (0, role_middleware_1.authorize)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.MANAGER), (0, validate_middleware_1.validate)(repayment_validation_1.confirmBankTransferSchema), (0, asyncHandler_1.asyncHandler)(controller.confirm));
exports.default = router;
