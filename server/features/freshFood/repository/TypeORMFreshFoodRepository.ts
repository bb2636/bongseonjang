import type { FreshFood } from '../domain/FreshFood';
import type { FreshFoodRepository } from './FreshFoodRepository';

export class TypeORMFreshFoodRepository implements FreshFoodRepository {
  async findAll(): Promise<FreshFood[]> {
    throw new Error('TypeORMFreshFoodRepository not implemented yet');
  }
}
