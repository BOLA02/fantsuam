"use strict";
// ledger.routes.ts
// FULL FILE — migrated to Central Identity SSO
// No authorize() in the original — any authenticated staff could hit these.
// Using loan.audit.view per the spec's permission list (this is a ledger/audit-trail view).
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ledger_controller_1 = require("./ledger.controller");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const identity_middleware_1 = require("../../middleware/identity.middleware");
const permission_middleware_1 = require("../../middleware/permission.middleware");
const resolveLocalUser_middleware_1 = require("../../middleware/resolveLocalUser.middleware");
const asyncHandler_1 = require("../../utils/asyncHandler");
const ledger_validation_1 = require("./ledger.validation");
const router = (0, express_1.Router)();
const controller = new ledger_controller_1.LedgerController();
router.use(identity_middleware_1.requireIdentity, (0, asyncHandler_1.asyncHandler)(resolveLocalUser_middleware_1.resolveLocalUser));
router.get('/', (0, permission_middleware_1.requirePermission)('loan.audit.view'), (0, validate_middleware_1.validate)(ledger_validation_1.listLedgerSchema), (0, asyncHandler_1.asyncHandler)(controller.getAll));
router.get('/:loanId', (0, permission_middleware_1.requirePermission)('loan.audit.view'), (0, validate_middleware_1.validate)(ledger_validation_1.loanLedgerParamSchema), (0, asyncHandler_1.asyncHandler)(controller.getForLoan));
exports.default = router;
