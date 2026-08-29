import { Router } from 'express';
import { LoanController } from './loan.controller';
import { validate } from '../../middleware/validate.middleware';
import { requireIdentity } from '../../middleware/identity.middleware';
import { requirePermission } from '../../middleware/permission.middleware';
import { resolveLocalUser } from '../../middleware/resolveLocalUser.middleware';
import { asyncHandler } from '../../utils/asyncHandler';
import { listLoansSchema, disburseLoanSchema } from './loan.validation';
import { authenticateCustomer } from '../../middleware/customer-auth.middleware';

const router = Router();
const controller = new LoanController();

// Customer-facing — untouched, separate auth system entirely
router.get('/me', authenticateCustomer, asyncHandler(controller.getMine));

// Staff-facing — SSO from here down
router.use(requireIdentity, asyncHandler(resolveLocalUser));

router.get('/', requirePermission('loan.loans.manage', 'loan.loans.view'), validate(listLoansSchema), asyncHandler(controller.getAll));
router.get('/:id', requirePermission('loan.loans.manage', 'loan.loans.view'), asyncHandler(controller.getById));

// ASSUMPTION: disbursement restricted to SUPER_ADMIN, MANAGER, CASHIER —
// not LOAN_OFFICER, since approval and payout are kept as separate controls.
// Same granularity problem as repayments/confirm: the spec only has one
// `loan.loans.manage` permission, but disbursement is a more sensitive
// action than viewing a loan. Using a placeholder until Central Identity
// confirms a distinct permission.
router.patch(
  '/:id/disburse',
  requirePermission('loan.loans.manage'),
  validate(disburseLoanSchema),
  asyncHandler(controller.disburse)
);

export default router;