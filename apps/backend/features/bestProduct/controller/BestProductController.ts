import type { Request, Response } from 'express';
import { BestProductService } from '../application/BestProductService';
import type { BestProductRepository, BestProductFilter } from '../repository/BestProductRepository';

export class BestProductController {
  private readonly service: BestProductService;

  constructor(repository: BestProductRepository) {
    this.service = new BestProductService(repository);
  }

  async getBestProducts(req: Request, res: Response): Promise<void> {
    try {
      const filter: BestProductFilter = {};
      const productCategoryId = req.query.productCategory as string | undefined;
      if (productCategoryId) {
        filter.productCategoryId = productCategoryId;
      }
      const products = await this.service.getBestProducts(filter);
      res.json(products);
    } catch (error) {
      console.error('Failed to fetch best products:', error);
      res.status(500).json({ error: 'Failed to fetch best products' });
    }
  }
}
