"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customer_auth_controller_1 = __importDefault(require("./customer-auth.controller"));
const validate_middleware_1 = require("../../middleware/validate.middleware");
const customer_auth_middleware_1 = require("../../middleware/customer-auth.middleware");
const customer_auth_validation_1 = require("./customer-auth.validation");
const router = (0, express_1.Router)();
router.post("/signup", (0, validate_middleware_1.validate)(customer_auth_validation_1.customerSignupSchema), customer_auth_controller_1.default.signup);
router.post("/login", (0, validate_middleware_1.validate)(customer_auth_validation_1.customerLoginSchema), customer_auth_controller_1.default.login);
router.get("/me", customer_auth_middleware_1.authenticateCustomer, customer_auth_controller_1.default.me);
exports.default = router;
