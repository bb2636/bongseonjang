import { Router, Request, Response } from 'express';
import { HomeDataService } from '../application/HomeDataService';

const router = Router();
const homeDataService = new HomeDataService();

router.get('/data', async (_req: Request, res: Response) => {
  try {
    const homeData = await homeDataService.getHomeData();
    res.json({ success: true, data: homeData });
  } catch (error) {
    console.error('Failed to fetch home data:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch home data' });
  }
});

export default router;
