// notification.routes.ts
// FULL FILE — migrated to Central Identity SSO
// No authorize() in the original — any authenticated staff could hit these.
// Preserved as-is: requireIdentity + resolveLocalUser only, no permission gate.

import { Router } from 'express';
import { NotificationController } from './notification.controller';
import { validate } from '../../middleware/validate.middleware';
import { requireIdentity } from '../../middleware/identity.middleware';
import { resolveLocalUser } from '../../middleware/resolveLocalUser.middleware';
import { asyncHandler } from '../../utils/asyncHandler';
import { listSmsSchema, sendManualSmsSchema } from './notification.validation';

const router = Router();
const controller = new NotificationController();

router.use(requireIdentity, resolveLocalUser);
router.get('/', validate(listSmsSchema), asyncHandler(controller.getAllSms));
router.post('/send', validate(sendManualSmsSchema), asyncHandler(controller.sendManual));
router.get('/templates', asyncHandler(controller.getTemplates));

export default router;