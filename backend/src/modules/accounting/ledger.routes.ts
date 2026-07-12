import { Router } from 'express';
import { LedgerController } from './ledger.controller';
import { validate } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../utils/asyncHandler';
import { listLedgerSchema, loanLedgerParamSchema } from './ledger.validation';

const router = Router();
const controller = new LedgerController();

router.use(authenticate);
router.get('/', validate(listLedgerSchema), asyncHandler(controller.getAll));
router.get('/:loanId', validate(loanLedgerParamSchema), asyncHandler(controller.getForLoan));

export default router;