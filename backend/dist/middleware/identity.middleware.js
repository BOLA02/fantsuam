"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireIdentity = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const identity_1 = require("../config/identity");
function extractBearerToken(req) {
    const header = req.headers.authorization;
    if (header && header.startsWith("Bearer ")) {
        return header.slice(7).trim();
    }
    return null;
}
function normalizePermissions(raw) {
    if (!raw)
        return [];
    return Array.isArray(raw) ? raw : [raw];
}
const requireIdentity = (req, res, next) => {
    const token = extractBearerToken(req);
    if (!token) {
        res.status(401).json({ success: false, message: "Missing bearer token" });
        return;
    }
    let decoded;
    try {
        decoded = jsonwebtoken_1.default.verify(token, identity_1.IDENTITY_PUBLIC_KEY_PEM, {
            algorithms: ["RS256"],
            issuer: identity_1.IDENTITY_ISSUER,
            audience: identity_1.IDENTITY_AUDIENCE,
        });
    }
    catch (err) {
        if (err instanceof jsonwebtoken_1.default.TokenExpiredError) {
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
exports.requireIdentity = requireIdentity;
