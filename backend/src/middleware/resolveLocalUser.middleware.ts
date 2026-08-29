// src/middleware/resolveLocalUser.middleware.ts
// Wrapped internally in try/catch so it's safe to use bare (no asyncHandler needed at call sites)
import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";

export const resolveLocalUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const identity = req.identity;

    if (!identity) {
      res.status(401).json({ success: false, message: "Unauthenticated" });
      return;
    }

    const { sub, employee_number } = identity;

    // Fast path: already linked
    let user = await prisma.user.findUnique({ where: { centralEmployeeId: sub } });

    if (!user) {
      // First-time SSO login for this person: bridge via employeeNumber
      const candidate = await prisma.user.findUnique({ where: { employeeNumber: employee_number } });

      if (!candidate) {
        res.status(401).json({ success: false, message: "No local account linked to this identity" });
        return;
      }

      if (candidate.centralEmployeeId && candidate.centralEmployeeId !== sub) {
        // Employee number matched a user already linked to a DIFFERENT sub — data conflict, don't silently proceed
        res.status(401).json({ success: false, message: "Identity mapping conflict — contact an administrator" });
        return;
      }

      user = await prisma.user.update({
        where: { id: candidate.id },
        data: { centralEmployeeId: sub },
      });
    }

    if (user.status !== "ACTIVE") {
      res.status(401).json({ success: false, message: "Account inactive" });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};