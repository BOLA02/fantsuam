"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_repository_1 = __importDefault(require("./auth.repository"));
const password_1 = require("../../utils/password");
const jwt_1 = require("../../utils/jwt");
const AppError_1 = require("../../utils/AppError");
class AuthService {
    async login(email, password) {
        const user = await auth_repository_1.default.findByEmail(email);
        if (!user) {
            throw new AppError_1.AppError(401, "Invalid email or password");
        }
        if (user.status !== "ACTIVE") {
            throw new AppError_1.AppError(403, "Account is inactive");
        }
        const validPassword = await (0, password_1.comparePassword)(password, user.passwordHash);
        if (!validPassword) {
            throw new AppError_1.AppError(401, "Invalid email or password");
        }
        await auth_repository_1.default.updateLastLogin(user.id);
        const token = (0, jwt_1.generateToken)({
            id: user.id,
            email: user.email,
            role: user.role,
        });
        return {
            token,
            user: {
                id: user.id,
                employeeNumber: user.employeeNumber,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                branch: user.branch,
            },
        };
    }
    async getCurrentUser(userId) {
        const user = await auth_repository_1.default.findById(userId);
        if (!user) {
            throw new AppError_1.AppError(404, "User not found");
        }
        return {
            id: user.id,
            employeeNumber: user.employeeNumber,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            status: user.status,
            branch: user.branch,
        };
    }
}
exports.default = new AuthService();
