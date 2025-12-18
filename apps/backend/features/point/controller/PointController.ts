import { Response } from 'express';
import { PointService } from '../application/PointService.js';
import { AuthenticatedRequest } from '../../../common/middleware/authMiddleware.js';

export class PointController {
  constructor(private readonly pointService: PointService) {}

  async getWallet(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const wallet = await this.pointService.getWallet(userId);
      res.json(wallet);
    } catch (error) {
      console.error('Error fetching point wallet:', error);
      res.status(500).json({ error: 'Failed to fetch point wallet' });
    }
  }

  async getTransactions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await this.pointService.getTransactions(userId, { page, limit });
      res.json(result);
    } catch (error) {
      console.error('Error fetching point transactions:', error);
      res.status(500).json({ error: 'Failed to fetch point transactions' });
    }
  }
}
