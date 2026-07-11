import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";
import { verifyToken } from "../utils/jwt";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization as string | undefined;

    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    // 💡 FIX: Grab index 1 to get the string, and cast it as a string
    const token = authHeader.split(" ")[1] as string;

    // Now 'token' is strictly a string, so verifyToken will accept it happily
    const payload = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: {
        id: String(payload.id),
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    if (user.status !== "ACTIVE") {
      res.status(401).json({
        success: false,
        message: "Account inactive",
      });
      return;
    }

    req.user = user;

    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};
