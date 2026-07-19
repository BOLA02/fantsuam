import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";
import { env } from "../config/env";

export async function requireApplicationFee(req: Request, res: Response, next: NextFunction) {
  const settings = await prisma.organizationSettings.findFirst();
  if (!settings?.applicationFeeEnabled || settings.applicationFeeAmount <= 0) return next();

  try {
    const token = req.header("X-Application-Fee-Token");
    if (!token) throw new Error("missing token");
    const payload = jwt.verify(token, env.JWT_SECRET) as { paymentId?: string; purpose?: string };
    if (payload.purpose !== "APPLICATION_FEE" || !payload.paymentId) throw new Error("invalid token");
    const payment = await prisma.applicationFeePayment.findUnique({ where: { id: payload.paymentId } });
    if (!payment || payment.status !== "SUCCESS" || payment.amount !== settings.applicationFeeAmount) throw new Error("unpaid");
    next();
  } catch {
    res.status(402).json({ success: false, message: "A verified application-fee payment is required before applying" });
  }
}
