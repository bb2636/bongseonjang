import type { Request, Response } from 'express';
import type { HeroImageApplicationService } from '../application/HeroImageApplicationService';

export class HeroImageController {
  constructor(private readonly heroImageService: HeroImageApplicationService) {}

  async getHeroImages(_req: Request, res: Response): Promise<void> {
    try {
      const heroImages = await this.heroImageService.getHeroImages();
      res.json({ success: true, data: heroImages });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch hero images' });
    }
  }
}
