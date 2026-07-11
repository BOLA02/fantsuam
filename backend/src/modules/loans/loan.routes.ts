import { Router } from 'express';
import { LoanController } from './loan.controller';
import { validate } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../utils/asyncHandler';
import { listLoansSchema } from './loan.validation';

const router = Router();
const controller = new LoanController();

router.use(authenticate);

router.get('/', validate(listLoansSchema), asyncHandler(controller.getAll));
router.get('/:id', asyncHandler(controller.getById));

export default router;