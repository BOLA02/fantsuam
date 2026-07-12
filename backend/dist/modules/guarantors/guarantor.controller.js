"use strict";
// src/modules/guarantors/guarantor.controller.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const guarantor_service_1 = __importDefault(require("./guarantor.service"));
class GuarantorController {
    async getAll(req, res, next) {
        try {
            const guarantors = await guarantor_service_1.default.getAll(req.query.customerId);
            res.status(200).json({
                success: true,
                data: guarantors,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const guarantor = await guarantor_service_1.default.getById(req.params.id);
            res.status(200).json({
                success: true,
                data: guarantor,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async create(req, res, next) {
        try {
            const guarantor = await guarantor_service_1.default.create(req.body);
            res.status(201).json({
                success: true,
                message: "Guarantor added successfully",
                data: guarantor,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const guarantor = await guarantor_service_1.default.update(req.params.id, req.body);
            res.status(200).json({
                success: true,
                message: "Guarantor updated successfully",
                data: guarantor,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            await guarantor_service_1.default.delete(req.params.id);
            res.status(200).json({
                success: true,
                message: "Guarantor deleted successfully",
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new GuarantorController();
