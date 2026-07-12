"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const authorize = (...roles) => (req, res, next) => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
        return;
    }
    if (!roles.includes(req.user.role)) {
        res.status(403).json({
            success: false,
            message: "Forbidden",
        });
        return;
    }
    next();
};
exports.authorize = authorize;
