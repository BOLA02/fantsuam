import { Request, Response, NextFunction } from "express";

// permission.middleware.ts — replace requirePermission body
export const requirePermission =
  (...anyOf: string[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const identity = req.identity;
    if (!identity) {
      res.status(401).json({ success: false, message: "Unauthenticated" });
      return;
    }
    const isSuperAdmin =
      identity.role === "loan.admin" ||
      identity.central_role?.includes("central.super_admin") ||
      identity.central_role?.includes("loan.admin");
    if (isSuperAdmin) {
      next();
      return;
    }
    const hasOne = anyOf.some((perm) => identity.permissions.includes(perm));
    if (!hasOne) {
      res.status(403).json({ success: false, message: "Insufficient permissions", required: anyOf });
      return;
    }
    next();
  };
