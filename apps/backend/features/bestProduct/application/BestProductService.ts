import type { BestProductRepository, BestProductFilter } from '../repository/BestProductRepository';
import type { BestProduct } from '../domain/BestProduct';

export class BestProductService {
  constructor(private readonly repository: BestProductRepository) {}

  async getBestProducts(filter?: BestProductFilter): Promise<BestProduct[]> {
    return this.repository.findAll(filter);
  }
}
