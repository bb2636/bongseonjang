import type { Request, Response } from 'express';
import { BongseonjangTvService } from '../application/BongseonjangTvService';
import { repositories } from '../../../config/repositories';

export class BongseonjangTvController {
  private readonly service: BongseonjangTvService;

  constructor() {
    this.service = new BongseonjangTvService(repositories.bongseonjangTv);
  }

  async getAll(request: Request, response: Response): Promise<void> {
    const images = await this.service.getAllImages();
    response.json(images);
  }
}
