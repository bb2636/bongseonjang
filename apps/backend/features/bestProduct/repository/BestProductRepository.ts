import type { BestProduct } from '../domain/BestProduct';

export interface BestProductRepository {
  findAll(): Promise<BestProduct[]>;
}
