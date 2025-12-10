import type { ProductDto } from '../domain/Product';
import type { ProductRepository } from '../repository/ProductRepository';

export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  async getProductsByDisplayCategory(categoryName: string): Promise<ProductDto[]> {
    return this.productRepository.findByDisplayCategory(categoryName);
  }

  async getAllProducts(): Promise<ProductDto[]> {
    return this.productRepository.findAll();
  }
}
