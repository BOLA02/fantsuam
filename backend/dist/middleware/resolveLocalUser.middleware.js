"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveLocalUser = void 0;
const crypto_1 = __importDefault(require("crypto"));
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../config/prisma"));
function mapCentralRoleToLocal(centralRole) {
    const map = {
        "loan.admin": client_1.UserRole.SUPER_ADMIN,
        "loan.manager": client_1.UserRole.MANAGER,
        "loan.officer": client_1.UserRole.LOAN_OFFICER,
        "loan.cashier": client_1.UserRole.CASHIER,
    };
    return map[centralRole] ?? client_1.UserRole.LOAN_OFFICER;
}
const resolveLocalUser = async (req, res, next) => {
    try {
        const identity = req.identity;
        if (!identity) {
            res.status(401).json({ success: false, message: "Unauthenticated" });
            return;
        }
        const { sub, employee_number, email, name, role } = identity;
        const available_service = identity.available_service;
        let user = await prisma_1.default.user.findUnique({ where: { centralEmployeeId: sub } });
        if (!user) {
            const candidate = await prisma_1.default.user.findUnique({ where: { employeeNumber: employee_number } });
            if (candidate) {
                if (candidate.centralEmployeeId && candidate.centralEmployeeId !== sub) {
                    res.status(401).json({ success: false, message: "Identity mapping conflict — contact an administrator" });
                    return;
                }
                user = await prisma_1.default.user.update({
                    where: { id: candidate.id },
                    data: { centralEmployeeId: sub },
                });
            }
            else {
                if (available_service !== "loan") {
                    res.status(401).json({ success: false, message: "No local account linked to this identity" });
                    return;
                }
                const defaultBranch = await prisma_1.default.branch.findUnique({ where: { branchCode: "HQ" } });
                if (!defaultBranch || !defaultBranch.isActive) {
                    res.status(500).json({ success: false, message: "Default branch (HQ) not found or inactive — check seed data" });
                    return;
                }
                const [firstName, ...rest] = (name ?? "").split(" ");
                user = await prisma_1.default.user.create({
                    data: {
                        centralEmployeeId: sub,
                        employeeNumber: employee_number,
                        email,
                        firstName: firstName || "",
                        lastName: rest.join(" ") || "",
                        role: mapCentralRoleToLocal(role),
                        status: "ACTIVE",
                        branchId: defaultBranch.id,
                        passwordHash: crypto_1.default.randomBytes(32).toString("hex"),
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
    }
    catch (error) {
        next(error);
    }
};
exports.resolveLocalUser = resolveLocalUser;
