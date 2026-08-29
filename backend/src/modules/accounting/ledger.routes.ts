// ledger.routes.ts
// FULL FILE — migrated to Central Identity SSO
// No authorize() in the original — any authenticated staff could hit these.
// Using loan.audit.view per the spec's permission list (this is a ledger/audit-trail view).

import { Router } from 'express';
import { LedgerController } from './ledger.controller';
import { validate } from '../../middleware/validate.middleware';
import { requireIdentity } from '../../middleware/identity.middleware';
import { requirePermission } from '../../middleware/permission.middleware';
import { resolveLocalUser } from '../../middleware/resolveLocalUser.middleware';
import { asyncHandler } from '../../utils/asyncHandler';
import { listLedgerSchema, loanLedgerParamSchema } from './ledger.validation';

const router = Router();
const controller = new LedgerController();

router.use(requireIdentity, asyncHandler(resolveLocalUser));

router.get('/', requirePermission('loan.audit.view'), validate(listLedgerSchema), asyncHandler(controller.getAll));
router.get('/:loanId', requirePermission('loan.audit.view'), validate(loanLedgerParamSchema), asyncHandler(controller.getForLoan));

export default router;