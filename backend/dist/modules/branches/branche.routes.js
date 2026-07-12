"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const branche_controller_1 = __importDefault(require("./branche.controller"));
const auth_middleware_1 = require("../../middleware/auth.middleware");
const role_middleware_1 = require("../../middleware/role.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const branche_validation_1 = require("./branche.validation");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get("/", branche_controller_1.default.getAll);
router.get("/:id", branche_controller_1.default.getById);
router.post("/", (0, role_middleware_1.authorize)("SUPER_ADMIN"), (0, validate_middleware_1.validate)(branche_validation_1.createBranchSchema), branche_controller_1.default.create);
router.patch("/:id", (0, role_middleware_1.authorize)("SUPER_ADMIN"), (0, validate_middleware_1.validate)(branche_validation_1.updateBranchSchema), branche_controller_1.default.update);
router.delete("/:id", (0, role_middleware_1.authorize)("SUPER_ADMIN"), branche_controller_1.default.delete);
exports.default = router;
