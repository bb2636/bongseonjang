import type { BestProduct } from '../domain/BestProduct';
import type { BestProductRepository } from './BestProductRepository';

export class TypeORMBestProductRepository implements BestProductRepository {
  async findAll(): Promise<BestProduct[]> {
    throw new Error('TypeORMBestProductRepository not implemented yet');
  }
}
