import type { TimeDeal } from '../domain/TimeDeal';

export interface TimeDealRepository {
  findActiveDeals(): Promise<TimeDeal[]>;
}
