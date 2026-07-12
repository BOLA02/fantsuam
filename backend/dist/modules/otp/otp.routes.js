"use strict";
// src/modules/otp/otp.routes.ts
// NEW FILE — mount this router in your root router (e.g. app.use('/api/otp', otpRoutes))
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const otp_controller_1 = require("./otp.controller");
const router = (0, express_1.Router)();
router.post("/request", otp_controller_1.requestOtp);
router.post("/verify", otp_controller_1.verifyOtp);
exports.default = router;
