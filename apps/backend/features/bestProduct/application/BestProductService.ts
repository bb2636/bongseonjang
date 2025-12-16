import type { BestProductRepository } from '../repository/BestProductRepository';
import type { BestProduct } from '../domain/BestProduct';

export class BestProductService {
  constructor(private readonly repository: BestProductRepository) {}

  async getBestProducts(): Promise<BestProduct[]> {
    return this.repository.findAll();
  }
}
