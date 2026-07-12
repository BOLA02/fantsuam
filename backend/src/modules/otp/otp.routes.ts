// src/modules/otp/otp.routes.ts
// NEW FILE — mount this router in your root router (e.g. app.use('/api/otp', otpRoutes))

import { Router } from "express";
import { requestOtp, verifyOtp } from "./otp.controller";

const router = Router();

router.post("/request", requestOtp);
router.post("/verify", verifyOtp);

export default router;