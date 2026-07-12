// src/modules/otp/otp.controller.ts
// NEW FILE — adjust to match your existing controller conventions (asyncHandler etc.)

import { Request, Response, NextFunction } from "express";
import otpService from "./otp.service";

export async function requestOtp(req: Request, res: Response, next: NextFunction) {
  try {
    const { phone } = req.body;
    const result = await otpService.requestOtp(phone);
    res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function verifyOtp(req: Request, res: Response, next: NextFunction) {
  try {
    const { phone, code } = req.body;
    const result = await otpService.verifyOtp(phone, code);
    res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
}