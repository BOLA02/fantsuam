import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import {
  IDENTITY_ISSUER,
  IDENTITY_AUDIENCE,
  IDENTITY_PUBLIC_KEY_PEM,
} from "../config/identity";
import { IdentityTokenPayload } from "../types/identity";

function extractBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) {
    return header.slice(7).trim();
  }
  return null;
}

function normalizePermissions(raw: string | string[] | undefined): string[] {
  if (!raw) return [];
  return Array.isArray(raw) ? raw : [raw];
}

export const requireIdentity = (req: Request, res: Response, next: NextFunction): void => {
  const token = extractBearerToken(req);

  if (!token) {
    res.status(401).json({ success: false, message: "Missing bearer token" });
    return;
  }

  let decoded: IdentityTokenPayload;

  try {
    decoded = jwt.verify(token, IDENTITY_PUBLIC_KEY_PEM, {
      algorithms: ["RS256"],
      issuer: IDENTITY_ISSUER,
      audience: IDENTITY_AUDIENCE,
    }) as IdentityTokenPayload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ success: false, message: "Token expired" });
      return;
    }
    res.status(401).json({ success: false, message: "Invalid token" });
    return;
  }

  if (decoded.service !== "loan") {
    res.status(401).json({ success: false, message: "Token not scoped for loan service" });
    return;
  }

  req.identity = {
    ...decoded,
    permissions: normalizePermissions(decoded.permission),
  };

  next();
};