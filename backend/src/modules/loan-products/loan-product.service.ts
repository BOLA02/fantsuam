import { ProductRepository } from './loan-product.repository';
import { AppError } from '../../utils/AppError';

export class ProductService {
  private repository = new ProductRepository();

  async createProduct(data: any) {
    const exists = await this.repository.findByCode(data.productCode);
    if (exists) throw new AppError(400, 'A loan product with this code already exists');
    return this.repository.create(data);
  }

  async getAllProducts() {
    return this.repository.findAll();
  }

  async getProductById(id: string) {
    const product = await this.repository.findById(id);
    if (!product) throw new AppError(404, 'Loan product not found');
    return product;
  }

  async updateProduct(id: string, data: any) {
    await this.getProductById(id);
    return this.repository.update(id, data);
  }

  async toggleStatus(id: string, isActive: boolean) {
    await this.getProductById(id);
    return this.repository.update(id, { isActive });
  }

  async deleteProduct(id: string) {
    await this.getProductById(id);
    const hasHistory = await this.repository.hasDependencies(id);
    if (hasHistory) {
      throw new AppError(400, 'Cannot delete this product; active applications or loans are running on it.');
    }
    return this.repository.softDelete(id);
  }
}
