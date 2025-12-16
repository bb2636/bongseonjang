import { Router, Request, Response } from 'express';
import { bannerRepository } from '../repository/bannerRepository';

const heroRouter = Router();
const middleBannerRouter = Router();
const bottomBannerRouter = Router();

async function getBannersByPosition(positionCode: string, res: Response) {
  try {
    const banners = await bannerRepository.findBannersByPositionCode(positionCode);
    
    const now = new Date();
    const activeBanners = banners.filter(banner => {
      if (!banner.isActive) return false;
      if (banner.startedAt && banner.startedAt > now) return false;
      if (banner.endedAt && banner.endedAt < now) return false;
      return true;
    });

    const response = {
      data: activeBanners.map(banner => ({
        id: banner.id,
        imageUrl: banner.imageUrl,
        linkUrl: banner.linkUrl,
      })),
    };

    res.json(response);
  } catch (error) {
    console.error(`Failed to fetch banners for position ${positionCode}:`, error);
    res.status(500).json({ error: '배너를 불러오는데 실패했습니다.' });
  }
}

heroRouter.get('/hero-images', async (req: Request, res: Response) => {
  await getBannersByPosition('HOME_HERO', res);
});

middleBannerRouter.get('/', async (req: Request, res: Response) => {
  await getBannersByPosition('HOME_MIDDLE', res);
});

bottomBannerRouter.get('/', async (req: Request, res: Response) => {
  await getBannersByPosition('HOME_BOTTOM', res);
});

export { 
  heroRouter as publicHeroRoutes, 
  middleBannerRouter as publicMiddleBannerRoutes,
  bottomBannerRouter as publicBottomBannerRoutes 
};
