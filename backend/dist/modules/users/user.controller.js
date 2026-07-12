"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_service_1 = __importDefault(require("./user.service"));
class UserController {
    async getAll(req, res, next) {
        try {
            const users = await user_service_1.default.getAll();
            res.status(200).json({
                success: true,
                data: users,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const user = await user_service_1.default.getById(req.params.id);
            res.status(200).json({
                success: true,
                data: user,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async create(req, res, next) {
        try {
            const user = await user_service_1.default.create(req.body);
            res.status(201).json({
                success: true,
                message: "User created successfully",
                data: user,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const user = await user_service_1.default.update(req.params.id, req.body);
            res.status(200).json({
                success: true,
                message: "User updated successfully",
                data: user,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async resetPassword(req, res, next) {
        try {
            await user_service_1.default.resetPassword(req.params.id, req.body.password);
            res.status(200).json({
                success: true,
                message: "Password reset successfully",
            });
        }
        catch (error) {
            next(error);
        }
    }
    async changePassword(req, res, next) {
        try {
            await user_service_1.default.changePassword(req.user.id, req.body.currentPassword, req.body.newPassword);
            res.status(200).json({
                success: true,
                message: "Password changed successfully",
            });
        }
        catch (error) {
            next(error);
        }
    }
    async changeStatus(req, res, next) {
        try {
            const user = await user_service_1.default.changeStatus(req.params.id, req.body.status);
            res.status(200).json({
                success: true,
                message: "User status updated successfully",
                data: user,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            await user_service_1.default.delete(req.params.id);
            res.status(200).json({
                success: true,
                message: "User deleted successfully",
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new UserController();
