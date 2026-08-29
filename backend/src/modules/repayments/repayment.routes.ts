import { Router } from 'express';
import { RepaymentController } from './repayment.controller';
import { validate } from '../../middleware/validate.middleware';
import { requireIdentity } from '../../middleware/identity.middleware';
import { requirePermission } from '../../middleware/permission.middleware';
import { resolveLocalUser } from '../../middleware/resolveLocalUser.middleware';
import { asyncHandler } from '../../utils/asyncHandler';
import {
  recordCashPaymentSchema,
  reportBankTransferSchema,
  confirmBankTransferSchema,
  listRepaymentsSchema,
  ledgerParamSchema,
} from './repayment.validation';

const router = Router();
const controller = new RepaymentController();

router.use(requireIdentity, asyncHandler(resolveLocalUser));

router.get('/', requirePermission('loan.repayments.manage', 'loan.repayments.record'), validate(listRepaymentsSchema), asyncHandler(controller.getAll));
router.get('/ledger/:loanId', requirePermission('loan.repayments.manage', 'loan.repayments.record'), validate(ledgerParamSchema), asyncHandler(controller.getLedger));

router.post(
  '/cash',
  requirePermission('loan.repayments.manage', 'loan.repayments.record'),
  validate(recordCashPaymentSchema),
  asyncHandler(controller.recordCash)
);

router.post(
  '/bank-transfer',
  requirePermission('loan.repayments.manage', 'loan.repayments.record'),
  validate(reportBankTransferSchema),
  asyncHandler(controller.reportBankTransfer)
);

// Confirm requires full manage — Loan Officer's .record permission
// intentionally does not include confirm, preserving two-step verification
// (the person recording a transfer shouldn't be the one confirming it).
router.patch(
  '/:id/confirm',
  requirePermission('loan.repayments.manage'),
  validate(confirmBankTransferSchema),
  asyncHandler(controller.confirm)
);

export default router;