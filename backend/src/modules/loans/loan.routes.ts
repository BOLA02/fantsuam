import { Router } from 'express';
import { LoanController } from './loan.controller';
import { validate } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { asyncHandler } from '../../utils/asyncHandler';
import { listLoansSchema, disburseLoanSchema } from './loan.validation';
import { UserRole } from '@prisma/client';

const router = Router();
const controller = new LoanController();

router.use(authenticate);

router.get('/', validate(listLoansSchema), asyncHandler(controller.getAll));
router.get('/:id', asyncHandler(controller.getById));

// ASSUMPTION: disbursement restricted to SUPER_ADMIN, MANAGER, CASHIER —
// not LOAN_OFFICER, since approval and payout are kept as separate controls.
// Change if your actual policy differs.
router.patch(
  '/:id/disburse',
  authorize(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.CASHIER),
  validate(disburseLoanSchema),
  asyncHandler(controller.disburse)
);

export default router;