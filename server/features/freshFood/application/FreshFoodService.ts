import type { FreshFoodRepository } from '../repository/FreshFoodRepository';
import type { FreshFood } from '../domain/FreshFood';

export class FreshFoodService {
  constructor(private readonly repository: FreshFoodRepository) {}

  async getFreshFoods(): Promise<FreshFood[]> {
    return this.repository.findAll();
  }
}
