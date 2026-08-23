import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { SavingsController } from './savings.controller';
import { validate } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
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


router.use(authenticate);

router.get(
  '/summary',
  asyncHandler(controller.getSummary)
);

router.get(
  '/customers/lookup',
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.MANAGER,
    UserRole.LOAN_OFFICER,
    UserRole.CASHIER
  ),
  asyncHandler(controller.lookupCustomer)
);

router.get(
  '/accounts',
  validate(listSavingsAccountsSchema),
  asyncHandler(controller.getAllAccounts)
);



router.post(
  '/accounts',
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.MANAGER,
    UserRole.CASHIER
  ),
  validate(provisionSavingsAccountSchema),
  asyncHandler(controller.provisionAccount)
);
router.get(
  '/accounts/:id',
  validate(accountIdParamSchema),
  asyncHandler(controller.getAccount)
);

router.get(
  '/accounts/:id/transactions',
  validate(listTransactionsSchema),
  asyncHandler(controller.getTransactions)
);

router.post(
  '/deposits',
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.MANAGER,
    UserRole.CASHIER,
    UserRole.LOAN_OFFICER
  ),
  validate(depositSchema),
  asyncHandler(controller.deposit)
);

router.post(
  '/withdrawals',
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.MANAGER,
    UserRole.CASHIER
  ),
  validate(withdrawalSchema),
  asyncHandler(controller.withdrawal)
);

export default router;