import type { FreshFood } from '../domain/FreshFood';

export interface FreshFoodRepository {
  findAll(): Promise<FreshFood[]>;
}
