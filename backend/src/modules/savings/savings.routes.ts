import { Router } from 'express';
import { SavingsController } from './savings.controller';
import { validate } from '../../middleware/validate.middleware';
import { requireIdentity } from '../../middleware/identity.middleware';
import { requirePermission } from '../../middleware/permission.middleware';
import { resolveLocalUser } from '../../middleware/resolveLocalUser.middleware';
import { asyncHandler } from '../../utils/asyncHandler';
import {
  provisionSavingsAccountSchema,
  depositSchema,
  withdrawalSchema,
  accountIdParamSchema,
  listSavingsAccountsSchema,
  listTransactionsSchema,
} from './savings.validation';

const router = Router();
const controller = new SavingsController();

router.use(requireIdentity, asyncHandler(resolveLocalUser));

router.get('/summary', requirePermission('loan.savings.manage'), asyncHandler(controller.getSummary));

router.get(
  '/customers/lookup',
  requirePermission('loan.savings.manage'),
  asyncHandler(controller.lookupCustomer)
);

router.get(
  '/accounts',
  requirePermission('loan.savings.manage'),
  validate(listSavingsAccountsSchema),
  asyncHandler(controller.getAllAccounts)
);

router.post(
  '/accounts',
  requirePermission('loan.savings.manage'),
  validate(provisionSavingsAccountSchema),
  asyncHandler(controller.provisionAccount)
);

router.get(
  '/accounts/:id',
  requirePermission('loan.savings.manage'),
  validate(accountIdParamSchema),
  asyncHandler(controller.getAccount)
);

router.get(
  '/accounts/:id/transactions',
  requirePermission('loan.savings.manage'),
  validate(listTransactionsSchema),
  asyncHandler(controller.getTransactions)
);

router.post(
  '/deposits',
  requirePermission('loan.savings.manage'),
  validate(depositSchema),
  asyncHandler(controller.deposit)
);

router.post(
  '/withdrawals',
  requirePermission('loan.savings.manage'),
  validate(withdrawalSchema),
  asyncHandler(controller.withdrawal)
);

export default router;