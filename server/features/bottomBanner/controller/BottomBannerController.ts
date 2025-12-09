import type { Request, Response } from 'express';
import type { BottomBannerService } from '../application/BottomBannerService';

export class BottomBannerController {
  constructor(private readonly service: BottomBannerService) {}

  async getBottomBanners(_req: Request, res: Response): Promise<void> {
    try {
      const banners = await this.service.getBottomBanners();
      res.json(banners);
    } catch (error) {
      console.error('Failed to get bottom banners:', error);
      res.status(500).json({ error: 'Failed to get bottom banners' });
    }
  }
}
