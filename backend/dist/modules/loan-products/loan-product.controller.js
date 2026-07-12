"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
const loan_product_service_1 = require("./loan-product.service");
const apiResponse_1 = require("../../utils/apiResponse");
class ProductController {
    service = new loan_product_service_1.ProductService();
    create = async (req, res) => {
        const result = await this.service.createProduct(req.body);
        return res.status(201).json(apiResponse_1.ApiResponse.success(result, 'Loan product created successfully'));
    };
    getAll = async (req, res) => {
        const result = await this.service.getAllProducts();
        return res.status(200).json(apiResponse_1.ApiResponse.success(result, 'Loan products retrieved successfully'));
    };
    getById = async (req, res) => {
        const id = req.params.id;
        const result = await this.service.getProductById(id);
        return res.status(200).json(apiResponse_1.ApiResponse.success(result, 'Loan product retrieved successfully'));
    };
    update = async (req, res) => {
        const id = req.params.id;
        const result = await this.service.updateProduct(id, req.body);
        return res.status(200).json(apiResponse_1.ApiResponse.success(result, 'Loan product updated successfully'));
    };
    toggle = async (req, res) => {
        const id = req.params.id;
        const result = await this.service.toggleStatus(id, req.body.isActive);
        const statusText = req.body.isActive ? 'Active' : 'Inactive';
        return res.status(200).json(apiResponse_1.ApiResponse.success(result, `Product status changed to ${statusText}`));
    };
    delete = async (req, res) => {
        const id = req.params.id;
        await this.service.deleteProduct(id);
        return res.status(200).json(apiResponse_1.ApiResponse.success(null, 'Loan product deleted successfully (soft-deleted)'));
    };
}
exports.ProductController = ProductController;
