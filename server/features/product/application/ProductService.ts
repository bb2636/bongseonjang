import type { ProductDto } from '../domain/Product';
import type { ProductRepository, ProductFilter } from '../repository/ProductRepository';

export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  async getProductsByDisplayCategory(displayCategoryName: string, filter?: ProductFilter): Promise<ProductDto[]> {
    return this.productRepository.findByDisplayCategory(displayCategoryName, filter);
  }

  async getAllProducts(filter?: ProductFilter): Promise<ProductDto[]> {
    return this.productRepository.findAll(filter);
  }
}
