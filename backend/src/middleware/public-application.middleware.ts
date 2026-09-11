import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";
import { env } from "../config/env";

export async function requirePublicApplicationOwner(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.header("X-Application-Access-Token");
    if (!token) {
      res.status(401).json({ success: false, message: "Application ownership verification is required" });
      return;
    }
    const payload = jwt.verify(token, env.JWT_SECRET) as { customerId?: string; purpose?: string };
    if (!['public-application', 'resume'].includes(payload.purpose ?? '') || !payload.customerId) {
      throw new Error("invalid token");
    }

    const body = req.body ?? {};
    if (body.customerId && body.customerId !== payload.customerId) throw new Error("customer mismatch");

    if (body.applicationId) {
      const owned = await prisma.loanApplication.findFirst({ where: { id: body.applicationId, customerId: payload.customerId } });
      if (!owned) throw new Error("application mismatch");
    }
    if (body.guarantorId) {
      const owned = await prisma.guarantor.findFirst({ where: { id: body.guarantorId, customerId: payload.customerId } });
      if (!owned) throw new Error("guarantor mismatch");
    }
    if (body.collateralId) {
      const owned = await prisma.collateral.findFirst({ where: { id: body.collateralId, loan: { customerId: payload.customerId } } });
      if (!owned) throw new Error("collateral mismatch");
    }

    (req as any).publicCustomerId = payload.customerId;
    next();
  } catch {
    res.status(403).json({ success: false, message: "You cannot modify another customer's application" });
  }
}
