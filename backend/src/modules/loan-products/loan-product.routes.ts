// src/modules/loan-products/loan-product.routes.ts
// FULL FILE — migrated to Central Identity SSO
// GET routes stay fully public (no auth at all — preserved as-is).
// Mutating routes now use requireIdentity + resolveLocalUser + requirePermission('loan.loan-products.manage')

import { Router } from 'express';
import { ProductController } from './loan-product.controller';
import { validate } from '../../middleware/validate.middleware';
import { requireIdentity } from '../../middleware/identity.middleware';
import { resolveLocalUser } from '../../middleware/resolveLocalUser.middleware';
import { requirePermission } from '../../middleware/permission.middleware';
import { asyncHandler } from '../../utils/asyncHandler';
import { createProductSchema, updateProductSchema, toggleProductSchema } from './loan-product.validation';

const router = Router();
const controller = new ProductController();

// Public — the apply page's loan-type picker needs to read active products
// before a customer has any auth token at all.
router.get('/', asyncHandler(controller.getAll));
router.get('/:id', asyncHandler(controller.getById));

// Everything that creates/modifies/deletes products stays staff-only.
router.use(requireIdentity, resolveLocalUser);


router.post('/', requirePermission('loan.employees.manage'), validate(createProductSchema), asyncHandler(controller.create));
router.put('/:id', requirePermission('loan.employees.manage'), validate(updateProductSchema), asyncHandler(controller.update));
router.patch('/:id/toggle', requirePermission('loan.employees.manage'), validate(toggleProductSchema), asyncHandler(controller.toggle));
router.delete('/:id', requirePermission('loan.employees.manage'), asyncHandler(controller.delete));
export default router;