"use strict";
// src/modules/search/search.routes.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const search_controller_1 = __importDefault(require("./search.controller"));
const auth_middleware_1 = require("../../middleware/auth.middleware");
const role_middleware_1 = require("../../middleware/role.middleware");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get("/global", (0, role_middleware_1.authorize)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.MANAGER, client_1.UserRole.LOAN_OFFICER, client_1.UserRole.CASHIER), search_controller_1.default.global);
exports.default = router;
