import type { Product } from '../../../entity/Product';
import type { ProductRepository, ProductFilter } from './ProductRepository';

export class MockProductRepository implements ProductRepository {
  async findByDisplayCategory(_displayCategoryName: string, _filter?: ProductFilter): Promise<Product[]> {
    return [];
  }

  async findAll(_filter?: ProductFilter): Promise<Product[]> {
    return [];
  }

  async findById(_id: string): Promise<Product | null> {
    return null;
  }

  async findRelatedProducts(_productId: string, _limit: number): Promise<Product[]> {
    return [];
  }

  async findTimeDeals(_limit?: number): Promise<Product[]> {
    return [];
  }

  async findByTag(_tag: string, _limit?: number, _filter?: ProductFilter): Promise<Product[]> {
    return [];
  }

  async findFreshProducts(_limit?: number): Promise<Product[]> {
    return [];
  }

  async findByCategory(_categoryId: string, _page: number, _limit: number): Promise<{ products: Product[]; total: number }> {
    return { products: [], total: 0 };
  }
}
