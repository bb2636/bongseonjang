import type { TimeDeal } from '../domain/TimeDeal';
import type { TimeDealRepository } from './TimeDealRepository';

export class TypeORMTimeDealRepository implements TimeDealRepository {
  async findActiveDeals(): Promise<TimeDeal[]> {
    throw new Error('TypeORMTimeDealRepository not implemented yet');
  }
}
