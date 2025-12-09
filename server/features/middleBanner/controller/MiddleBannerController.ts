import type { Request, Response } from 'express';
import { MiddleBannerService } from '../application/MiddleBannerService';
import type { MiddleBannerRepository } from '../repository/MiddleBannerRepository';

export class MiddleBannerController {
  private readonly service: MiddleBannerService;

  constructor(repository: MiddleBannerRepository) {
    this.service = new MiddleBannerService(repository);
  }

  async getMiddleBanners(_req: Request, res: Response): Promise<void> {
    try {
      const banners = await this.service.getMiddleBanners();
      res.json(banners);
    } catch (error) {
      console.error('Failed to fetch middle banners:', error);
      res.status(500).json({ error: 'Failed to fetch middle banners' });
    }
  }
}
