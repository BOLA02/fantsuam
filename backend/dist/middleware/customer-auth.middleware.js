"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateCustomer = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const jwt_1 = require("../utils/jwt");
const authenticateCustomer = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            res.status(401).json({ success: false, message: "Customer sign-in required" });
            return;
        }
        const payload = (0, jwt_1.verifyToken)(authHeader.slice(7));
        if (payload.role !== "CUSTOMER") {
            res.status(403).json({ success: false, message: "Customer access required" });
            return;
        }
        const customer = await prisma_1.default.customer.findFirst({
            where: { id: payload.id, deletedAt: null, status: "ACTIVE" },
        });
        if (!customer) {
            res.status(401).json({ success: false, message: "Customer account is unavailable" });
            return;
        }
        req.customer = customer;
        next();
    }
    catch {
        res.status(401).json({ success: false, message: "Invalid or expired customer session" });
    }
};
exports.authenticateCustomer = authenticateCustomer;
