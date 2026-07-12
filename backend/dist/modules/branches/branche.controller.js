"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const branche_service_1 = __importDefault(require("./branche.service"));
class BranchController {
    async getAll(req, res, next) {
        try {
            const branches = await branche_service_1.default.getAll();
            res.status(200).json({
                success: true,
                data: branches,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            // 💡 FIX: Force cast the param ID to a string to satisfy the service argument
            const branchId = req.params.id;
            const branch = await branche_service_1.default.getById(branchId);
            res.status(200).json({
                success: true,
                data: branch,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async create(req, res, next) {
        try {
            const branch = await branche_service_1.default.create(req.body);
            res.status(201).json({
                success: true,
                message: "Branch created successfully",
                data: branch,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            // 💡 FIX: Force cast the param ID to a string here as well
            const branchId = req.params.id;
            const branch = await branche_service_1.default.update(branchId, req.body);
            res.status(200).json({
                success: true,
                message: "Branch updated successfully",
                data: branch,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            // 💡 FIX: Force cast the param ID to a string here too
            const branchId = req.params.id;
            await branche_service_1.default.delete(branchId);
            res.status(200).json({
                success: true,
                message: "Branch deleted successfully",
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new BranchController();
