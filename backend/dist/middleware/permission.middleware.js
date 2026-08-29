"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePermission = void 0;
// permission.middleware.ts — replace requirePermission body
const requirePermission = (...anyOf) => (req, res, next) => {
    const identity = req.identity;
    if (!identity) {
        res.status(401).json({ success: false, message: "Unauthenticated" });
        return;
    }
    const hasOne = anyOf.some((perm) => identity.permissions.includes(perm));
    if (!hasOne) {
        res.status(403).json({ success: false, message: "Insufficient permissions", required: anyOf });
        return;
    }
    next();
};
exports.requirePermission = requirePermission;
