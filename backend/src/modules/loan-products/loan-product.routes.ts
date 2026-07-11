import { Router } from 'express';
import { ProductController } from './loan-product.controller';
import { validate } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { asyncHandler } from '../../utils/asyncHandler';
import { createProductSchema, updateProductSchema, toggleProductSchema } from './loan-product.validation';
import { UserRole } from '@prisma/client';

const router = Router();
const controller = new ProductController();

router.use(authenticate);

// Allow both SUPER_ADMIN and MANAGER to perform administrative actions on products
router.post('/', authorize(UserRole.SUPER_ADMIN, UserRole.MANAGER), validate(createProductSchema), asyncHandler(controller.create));
router.get('/', asyncHandler(controller.getAll));
router.get('/:id', asyncHandler(controller.getById));
router.put('/:id', authorize(UserRole.SUPER_ADMIN, UserRole.MANAGER), validate(updateProductSchema), asyncHandler(controller.update));
router.patch('/:id/toggle', authorize(UserRole.SUPER_ADMIN, UserRole.MANAGER), validate(toggleProductSchema), asyncHandler(controller.toggle));
router.delete('/:id', authorize(UserRole.SUPER_ADMIN, UserRole.MANAGER), asyncHandler(controller.delete));

export default router;
