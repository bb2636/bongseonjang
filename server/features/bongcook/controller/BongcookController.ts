import type { Request, Response } from 'express';
import { BongcookService } from '../application/BongcookService';
import { repositories } from '../../../config/repositories';

export class BongcookController {
  private readonly service: BongcookService;

  constructor() {
    this.service = new BongcookService(repositories.bongcook);
  }

  async getAll(request: Request, response: Response): Promise<void> {
    const products = await this.service.getAllProducts();
    response.json(products);
  }
}
