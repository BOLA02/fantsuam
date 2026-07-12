"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const customer_service_1 = __importDefault(require("./customer.service"));
class CustomerController {
    async getAll(req, res, next) {
        try {
            const customers = await customer_service_1.default.getAll();
            res.status(200).json({
                success: true,
                data: customers,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const customer = await customer_service_1.default.getById(req.params.id);
            res.status(200).json({
                success: true,
                data: customer,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async create(req, res, next) {
        try {
            const customer = await customer_service_1.default.create(req.body);
            res.status(201).json({
                success: true,
                message: "Customer created successfully",
                data: customer,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const customer = await customer_service_1.default.update(req.params.id, req.body);
            res.status(200).json({
                success: true,
                message: "Customer updated successfully",
                data: customer,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async search(req, res, next) {
        try {
            const keyword = req.query.q;
            const customers = await customer_service_1.default.search(keyword);
            res.status(200).json({
                success: true,
                data: customers,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            await customer_service_1.default.delete(req.params.id);
            res.status(200).json({
                success: true,
                message: "Customer deleted successfully",
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new CustomerController();
