"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customer_auth_middleware_1 = require("../../middleware/customer-auth.middleware");
const customer_account_controller_1 = __importDefault(require("./customer-account.controller"));
const router = (0, express_1.Router)();
router.use(customer_auth_middleware_1.authenticateCustomer);
router.get("/loans", customer_account_controller_1.default.loans);
router.get("/repayments", customer_account_controller_1.default.repayments);
exports.default = router;
