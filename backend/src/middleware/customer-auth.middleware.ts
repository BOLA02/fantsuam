import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";
import { verifyToken } from "../utils/jwt";

export const authenticateCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ success: false, message: "Customer sign-in required" });
      return;
    }

    const payload = verifyToken(authHeader.slice(7));
    if (payload.role !== "CUSTOMER") {
      res.status(403).json({ success: false, message: "Customer access required" });
      return;
    }

    const customer = await prisma.customer.findFirst({
      where: { id: payload.id, deletedAt: null, status: "ACTIVE" },
    });
    if (!customer) {
      res.status(401).json({ success: false, message: "Customer account is unavailable" });
      return;
    }

    req.customer = customer;
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid or expired customer session" });
  }
};
