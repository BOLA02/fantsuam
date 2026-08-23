"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const client_1 = require("@prisma/client");
const AppError_1 = require("../utils/AppError");
// Maps a Prisma unique-constraint field name to a friendly label
const fieldLabels = {
    bvn: "BVN",
    nin: "NIN",
    email: "Email",
    phone: "Phone number",
    alternatePhone: "Alternate phone number",
    employeeNumber: "Employee number",
    customerNumber: "Customer number",
    branchCode: "Branch code",
    code: "Code",
};
const errorHandler = (err, req, res, next) => {
    if (err instanceof AppError_1.AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
    }
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        // Unique constraint violation
        if (err.code === "P2002") {
            const target = err.meta?.target;
            const fields = Array.isArray(target) ? target : target ? [target] : [];
            const label = fields.map((f) => fieldLabels[f] || f).join(", ") || "value";
            return res.status(409).json({
                success: false,
                message: `${label} already exists`,
            });
        }
        // Record not found (update/delete on missing row)
        if (err.code === "P2025") {
            return res.status(404).json({
                success: false,
                message: "Record not found",
            });
        }
        // Foreign key constraint failure (e.g. invalid branchId)
        if (err.code === "P2003") {
            return res.status(400).json({
                success: false,
                message: "Invalid reference — related record does not exist",
            });
        }
        console.error(err);
        return res.status(400).json({
            success: false,
            message: "Database request could not be processed",
        });
    }
    console.error(err);
    return res.status(500).json({
        success: false,
        message: "Internal Server Error",
    });
};
exports.errorHandler = errorHandler;
