import type { Request, Response } from 'express';
import type { BadameunService } from '../application/BadameunService';

export class BadameunController {
  constructor(private readonly badameunService: BadameunService) {}

  getBadameunProducts = async (_req: Request, res: Response): Promise<void> => {
    try {
      const products = await this.badameunService.getBadameunProducts();
      res.json(products);
    } catch (error) {
      console.error('Error fetching badameun products:', error);
      res.status(500).json({ error: 'Failed to fetch badameun products' });
    }
  };
}
