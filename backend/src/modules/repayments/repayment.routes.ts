import { Router } from 'express';
import { RepaymentController } from './repayment.controller';
import { validate } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { asyncHandler } from '../../utils/asyncHandler';
import {
  recordCashPaymentSchema,
  reportBankTransferSchema,
  confirmBankTransferSchema,
  listRepaymentsSchema,
  ledgerParamSchema,
} from './repayment.validation';
import { UserRole } from '@prisma/client';

const router = Router();
const controller = new RepaymentController();

router.use(authenticate);

router.get('/', validate(listRepaymentsSchema), asyncHandler(controller.getAll));
router.get('/ledger/:loanId', validate(ledgerParamSchema), asyncHandler(controller.getLedger));

router.post(
  '/cash',
  authorize(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.CASHIER, UserRole.LOAN_OFFICER),
  validate(recordCashPaymentSchema),
  asyncHandler(controller.recordCash)
);

router.post(
  '/bank-transfer',
  authorize(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.CASHIER, UserRole.LOAN_OFFICER),
  validate(reportBankTransferSchema),
  asyncHandler(controller.reportBankTransfer)
);

// ASSUMPTION: only admins/managers confirm — not the officer who reported
// it, to keep the two-step verification meaningful.
router.patch(
  '/:id/confirm',
  authorize(UserRole.SUPER_ADMIN, UserRole.MANAGER),
  validate(confirmBankTransferSchema),
  asyncHandler(controller.confirm)
);

export default router;