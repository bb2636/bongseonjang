import type { TimeDealRepository } from '../repository/TimeDealRepository';
import type { TimeDeal } from '../domain/TimeDeal';

export class TimeDealService {
  constructor(private readonly repository: TimeDealRepository) {}

  async getActiveDeals(): Promise<TimeDeal[]> {
    return this.repository.findActiveDeals();
  }
}
