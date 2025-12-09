import type { Request, Response } from 'express';
import { TimeDealService } from '../application/TimeDealService';
import type { TimeDealRepository } from '../repository/TimeDealRepository';

export class TimeDealController {
  private readonly service: TimeDealService;

  constructor(repository: TimeDealRepository) {
    this.service = new TimeDealService(repository);
  }

  async getActiveDeals(_req: Request, res: Response): Promise<void> {
    try {
      const deals = await this.service.getActiveDeals();
      res.json(deals);
    } catch (error) {
      console.error('Failed to fetch time deals:', error);
      res.status(500).json({ error: 'Failed to fetch time deals' });
    }
  }
}
