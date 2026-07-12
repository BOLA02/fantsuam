"use strict";
// src/modules/documents/document.controller.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const document_service_1 = __importDefault(require("./document.service"));
const AppError_1 = require("../../utils/AppError");
class DocumentController {
    async getAll(req, res, next) {
        try {
            const documents = await document_service_1.default.getAll({
                customerId: req.query.customerId,
                guarantorId: req.query.guarantorId,
                applicationId: req.query.applicationId,
                collateralId: req.query.collateralId,
                verificationStatus: req.query.verificationStatus,
            });
            res.status(200).json({
                success: true,
                data: documents,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const document = await document_service_1.default.getById(req.params.id);
            res.status(200).json({
                success: true,
                data: document,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async upload(req, res, next) {
        try {
            if (!req.file) {
                throw new AppError_1.AppError(400, "No file uploaded");
            }
            const uploadedById = req.user?.id;
            const document = await document_service_1.default.upload(req.body, req.file, uploadedById);
            res.status(201).json({
                success: true,
                message: "Document uploaded successfully",
                data: document,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async verify(req, res, next) {
        try {
            const document = await document_service_1.default.verify(req.params.id, req.body.verificationStatus, req.body.remarks);
            res.status(200).json({
                success: true,
                message: "Document verification updated",
                data: document,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            await document_service_1.default.delete(req.params.id);
            res.status(200).json({
                success: true,
                message: "Document deleted successfully",
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new DocumentController();
