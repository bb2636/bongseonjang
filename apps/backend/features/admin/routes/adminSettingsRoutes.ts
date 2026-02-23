import { Router, Request, Response } from 'express';
import { homeDataCache } from '../../../features/home/application/HomeDataService';
import { reviewStatsCache } from '../../../features/review/application/ReviewService';

const router = Router();

router.post('/cache/clear', async (req: Request, res: Response) => {
  try {
    const { cacheType = 'all' } = req.body || {};
    const clearedCaches: string[] = [];

    if (cacheType === 'all' || cacheType === 'home') {
      homeDataCache.invalidateAll();
      clearedCaches.push('home');
    }

    if (cacheType === 'all' || cacheType === 'reviews') {
      reviewStatsCache.invalidateAll();
      clearedCaches.push('reviews');
    }

    return res.json({
      success: true,
      message: '캐시가 초기화되었습니다',
      clearedCaches,
    });
  } catch (error) {
    console.error('Failed to clear cache:', error);
    return res.status(500).json({ error: '캐시 초기화에 실패했습니다' });
  }
});

router.get('/cache/status', async (_req: Request, res: Response) => {
  try {
    return res.json({
      caches: {
        home: {
          size: homeDataCache.size,
          maxSize: homeDataCache.maxSizeValue,
        },
        reviews: {
          size: reviewStatsCache.size,
          maxSize: reviewStatsCache.maxSizeValue,
        },
      },
    });
  } catch (error) {
    console.error('Failed to get cache status:', error);
    return res.status(500).json({ error: '캐시 상태를 불러오는데 실패했습니다' });
  }
});

export { router as adminSettingsRoutes };
