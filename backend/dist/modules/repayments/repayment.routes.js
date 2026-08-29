"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const repayment_controller_1 = require("./repayment.controller");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const identity_middleware_1 = require("../../middleware/identity.middleware");
const permission_middleware_1 = require("../../middleware/permission.middleware");
const resolveLocalUser_middleware_1 = require("../../middleware/resolveLocalUser.middleware");
const asyncHandler_1 = require("../../utils/asyncHandler");
const repayment_validation_1 = require("./repayment.validation");
const router = (0, express_1.Router)();
const controller = new repayment_controller_1.RepaymentController();
router.use(identity_middleware_1.requireIdentity, (0, asyncHandler_1.asyncHandler)(resolveLocalUser_middleware_1.resolveLocalUser));
router.get('/', (0, permission_middleware_1.requirePermission)('loan.repayments.manage', 'loan.repayments.record'), (0, validate_middleware_1.validate)(repayment_validation_1.listRepaymentsSchema), (0, asyncHandler_1.asyncHandler)(controller.getAll));
router.get('/ledger/:loanId', (0, permission_middleware_1.requirePermission)('loan.repayments.manage', 'loan.repayments.record'), (0, validate_middleware_1.validate)(repayment_validation_1.ledgerParamSchema), (0, asyncHandler_1.asyncHandler)(controller.getLedger));
router.post('/cash', (0, permission_middleware_1.requirePermission)('loan.repayments.manage', 'loan.repayments.record'), (0, validate_middleware_1.validate)(repayment_validation_1.recordCashPaymentSchema), (0, asyncHandler_1.asyncHandler)(controller.recordCash));
router.post('/bank-transfer', (0, permission_middleware_1.requirePermission)('loan.repayments.manage', 'loan.repayments.record'), (0, validate_middleware_1.validate)(repayment_validation_1.reportBankTransferSchema), (0, asyncHandler_1.asyncHandler)(controller.reportBankTransfer));
// Confirm requires full manage — Loan Officer's .record permission
// intentionally does not include confirm, preserving two-step verification
// (the person recording a transfer shouldn't be the one confirming it).
router.patch('/:id/confirm', (0, permission_middleware_1.requirePermission)('loan.repayments.manage'), (0, validate_middleware_1.validate)(repayment_validation_1.confirmBankTransferSchema), (0, asyncHandler_1.asyncHandler)(controller.confirm));
exports.default = router;
