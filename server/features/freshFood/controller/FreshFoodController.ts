import type { Request, Response } from 'express';
import { FreshFoodService } from '../application/FreshFoodService';
import type { FreshFoodRepository } from '../repository/FreshFoodRepository';

export class FreshFoodController {
  private readonly service: FreshFoodService;

  constructor(repository: FreshFoodRepository) {
    this.service = new FreshFoodService(repository);
  }

  async getFreshFoods(_req: Request, res: Response): Promise<void> {
    try {
      const foods = await this.service.getFreshFoods();
      res.json(foods);
    } catch (error) {
      console.error('Failed to fetch fresh foods:', error);
      res.status(500).json({ error: 'Failed to fetch fresh foods' });
    }
  }
}
