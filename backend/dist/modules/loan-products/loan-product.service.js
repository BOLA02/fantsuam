"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const loan_product_repository_1 = require("./loan-product.repository");
const AppError_1 = require("../../utils/AppError");
class ProductService {
    repository = new loan_product_repository_1.ProductRepository();
    async createProduct(data) {
        const exists = await this.repository.findByCode(data.productCode);
        if (exists)
            throw new AppError_1.AppError(400, 'A loan product with this code already exists');
        return this.repository.create(data);
    }
    async getAllProducts() {
        return this.repository.findAll();
    }
    async getProductById(id) {
        const product = await this.repository.findById(id);
        if (!product)
            throw new AppError_1.AppError(404, 'Loan product not found');
        return product;
    }
    async updateProduct(id, data) {
        await this.getProductById(id);
        return this.repository.update(id, data);
    }
    async toggleStatus(id, isActive) {
        await this.getProductById(id);
        return this.repository.update(id, { isActive });
    }
    async deleteProduct(id) {
        await this.getProductById(id);
        const hasHistory = await this.repository.hasDependencies(id);
        if (hasHistory) {
            throw new AppError_1.AppError(400, 'Cannot delete this product; active applications or loans are running on it.');
        }
        return this.repository.softDelete(id);
    }
}
exports.ProductService = ProductService;
