// notification.routes.ts
import { Router } from 'express';
import { NotificationController } from './notification.controller';
import { validate } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../utils/asyncHandler';
import { listSmsSchema, sendManualSmsSchema } from './notification.validation';

const router = Router();
const controller = new NotificationController();

router.use(authenticate);
router.get('/', validate(listSmsSchema), asyncHandler(controller.getAllSms));
router.post('/send', validate(sendManualSmsSchema), asyncHandler(controller.sendManual));
router.get('/templates', asyncHandler(controller.getTemplates));

export default router;