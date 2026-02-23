import { Router, Request, Response } from 'express';
import { HomeDataService } from '../application/HomeDataService';

const router = Router();
const homeDataService = new HomeDataService();

const CACHE_TTL_MS = 30 * 1000;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache: {
  aboveFold?: CacheEntry<unknown>;
  belowFold?: CacheEntry<unknown>;
  fullData?: CacheEntry<unknown>;
} = {};

function isCacheValid<T>(entry: CacheEntry<T> | undefined): entry is CacheEntry<T> {
  if (!entry) return false;
  return Date.now() - entry.timestamp < CACHE_TTL_MS;
}

router.get('/data', async (_req: Request, res: Response) => {
  try {
    if (isCacheValid(cache.fullData)) {
      return res.json({ success: true, data: cache.fullData.data });
    }
    const homeData = await homeDataService.getHomeData();
    cache.fullData = { data: homeData, timestamp: Date.now() };
    res.json({ success: true, data: homeData });
  } catch (error) {
    console.error('Failed to fetch home data:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch home data' });
  }
});

router.get('/above-fold', async (_req: Request, res: Response) => {
  try {
    if (isCacheValid(cache.aboveFold)) {
      return res.json({ success: true, data: cache.aboveFold.data });
    }
    const data = await homeDataService.getAboveFoldData();
    cache.aboveFold = { data, timestamp: Date.now() };
    res.json({ success: true, data });
  } catch (error) {
    console.error('Failed to fetch above-fold data:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch above-fold data' });
  }
});

router.get('/below-fold', async (_req: Request, res: Response) => {
  try {
    if (isCacheValid(cache.belowFold)) {
      return res.json({ success: true, data: cache.belowFold.data });
    }
    const data = await homeDataService.getBelowFoldData();
    cache.belowFold = { data, timestamp: Date.now() };
    res.json({ success: true, data });
  } catch (error) {
    console.error('Failed to fetch below-fold data:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch below-fold data' });
  }
});

router.post('/invalidate-cache', async (_req: Request, res: Response) => {
  try {
    HomeDataService.invalidateCache();
    cache.aboveFold = undefined;
    cache.belowFold = undefined;
    cache.fullData = undefined;
    res.json({ success: true, message: 'Home data cache invalidated' });
  } catch (error) {
    console.error('Failed to invalidate cache:', error);
    res.status(500).json({ success: false, message: 'Failed to invalidate cache' });
  }
});

export default router;
