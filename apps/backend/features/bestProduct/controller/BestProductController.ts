import type { Request, Response } from 'express';
import { BestProductService } from '../application/BestProductService';
import type { BestProductRepository } from '../repository/BestProductRepository';

export class BestProductController {
  private readonly service: BestProductService;

  constructor(repository: BestProductRepository) {
    this.service = new BestProductService(repository);
  }

  async getBestProducts(_req: Request, res: Response): Promise<void> {
    try {
      const products = await this.service.getBestProducts();
      res.json(products);
    } catch (error) {
      console.error('Failed to fetch best products:', error);
      res.status(500).json({ error: 'Failed to fetch best products' });
    }
  }
}
