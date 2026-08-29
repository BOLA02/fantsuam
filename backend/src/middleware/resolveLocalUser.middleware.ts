// src/middleware/resolveLocalUser.middleware.ts
import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { UserRole } from "@prisma/client";
import prisma from "../config/prisma";

function mapCentralRoleToLocal(centralRole: string): UserRole {
  const map: Record<string, UserRole> = {
    "loan.admin": UserRole.SUPER_ADMIN,
    "loan.manager": UserRole.MANAGER,
    "loan.officer": UserRole.LOAN_OFFICER,
    "loan.cashier": UserRole.CASHIER,
  };
  return map[centralRole] ?? UserRole.LOAN_OFFICER;
}

export const resolveLocalUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const identity = req.identity;

    if (!identity) {
      res.status(401).json({ success: false, message: "Unauthenticated" });
      return;
    }

    const { sub, employee_number, email, name, role } = identity;
    const available_service = (identity as any).available_service;

    let user = await prisma.user.findUnique({ where: { centralEmployeeId: sub } });

    if (!user) {
      const candidate = await prisma.user.findUnique({ where: { employeeNumber: employee_number } });

      if (candidate) {
        if (candidate.centralEmployeeId && candidate.centralEmployeeId !== sub) {
          res.status(401).json({ success: false, message: "Identity mapping conflict — contact an administrator" });
          return;
        }

        user = await prisma.user.update({
          where: { id: candidate.id },
          data: { centralEmployeeId: sub },
        });
      } else {
        if (available_service !== "loan") {
          res.status(401).json({ success: false, message: "No local account linked to this identity" });
          return;
        }

        const defaultBranch = await prisma.branch.findUnique({ where: { branchCode: "HQ" } });
        if (!defaultBranch || !defaultBranch.isActive) {
          res.status(500).json({ success: false, message: "Default branch (HQ) not found or inactive — check seed data" });
          return;
        }

        const [firstName, ...rest] = (name ?? "").split(" ");

        user = await prisma.user.create({
          data: {
            centralEmployeeId: sub,
            employeeNumber: employee_number,
            email,
            firstName: firstName || "",
            lastName: rest.join(" ") || "",
            role: mapCentralRoleToLocal(role),
            status: "ACTIVE",
            branchId: defaultBranch.id,
            passwordHash: crypto.randomBytes(32).toString("hex"),
          },
        });
      }
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