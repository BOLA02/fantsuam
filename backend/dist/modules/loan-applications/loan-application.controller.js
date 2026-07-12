"use strict";
// src/modules/loan-applications/loan-application.controller.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const loan_application_service_1 = __importDefault(require("./loan-application.service"));
const system_user_1 = require("../../config/system-user"); // adjust path if this file lives elsewhere
class LoanApplicationController {
    async getAll(req, res, next) {
        try {
            const applications = await loan_application_service_1.default.getAll({
                status: req.query.status,
                customerId: req.query.customerId,
                loanProductId: req.query.loanProductId,
                assignedOfficerId: req.query.assignedOfficerId,
            });
            res.status(200).json({
                success: true,
                data: applications,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const application = await loan_application_service_1.default.getById(req.params.id);
            res.status(200).json({
                success: true,
                data: application,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async create(req, res, next) {
        try {
            const createdById = req.user?.id ?? (await (0, system_user_1.getSystemUserId)());
            const application = await loan_application_service_1.default.create(req.body, createdById);
            res.status(201).json({
                success: true,
                message: "Loan application created successfully",
                data: application,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const application = await loan_application_service_1.default.update(req.params.id, req.body);
            res.status(200).json({
                success: true,
                message: "Loan application updated successfully",
                data: application,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async assignOfficer(req, res, next) {
        try {
            const application = await loan_application_service_1.default.assignOfficer(req.params.id, req.body.assignedOfficerId);
            res.status(200).json({
                success: true,
                message: "Officer assigned successfully",
                data: application,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async changeStatus(req, res, next) {
        try {
            const changedById = req.user.id;
            const application = await loan_application_service_1.default.changeStatus(req.params.id, req.body.status, changedById, req.body.remarks);
            res.status(200).json({
                success: true,
                message: "Application status updated successfully",
                data: application,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async cancel(req, res, next) {
        try {
            const changedById = req.user.id;
            const application = await loan_application_service_1.default.cancel(req.params.id, changedById, req.body?.remarks);
            res.status(200).json({
                success: true,
                message: "Application cancelled successfully",
                data: application,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async addReview(req, res, next) {
        try {
            const reviewerId = req.user.id;
            const review = await loan_application_service_1.default.addReview(req.params.id, reviewerId, req.body.recommendation, req.body.comments);
            res.status(201).json({
                success: true,
                message: "Review added successfully",
                data: review,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getReviews(req, res, next) {
        try {
            const reviews = await loan_application_service_1.default.getReviews(req.params.id);
            res.status(200).json({
                success: true,
                data: reviews,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getStatusHistory(req, res, next) {
        try {
            const history = await loan_application_service_1.default.getStatusHistory(req.params.id);
            res.status(200).json({
                success: true,
                data: history,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new LoanApplicationController();
