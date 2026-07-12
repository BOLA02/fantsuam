"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const jwt_1 = require("../utils/jwt");
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
            return;
        }
        // 💡 FIX: Grab index 1 to get the string, and cast it as a string
        const token = authHeader.split(" ")[1];
        // Now 'token' is strictly a string, so verifyToken will accept it happily
        const payload = (0, jwt_1.verifyToken)(token);
        const user = await prisma_1.default.user.findUnique({
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
    }
    catch {
        res.status(401).json({
            success: false,
            message: "Invalid token",
        });
    }
};
exports.authenticate = authenticate;
