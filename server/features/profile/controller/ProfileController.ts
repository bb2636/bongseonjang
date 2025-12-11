import { Request, Response } from 'express';
import { ProfileService } from '../application/ProfileService';

export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = 'user-1';
      const profile = await this.profileService.getUserProfile(userId);
      
      if (!profile) {
        res.status(404).json({ error: 'Profile not found' });
        return;
      }
      
      res.json(profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  }

  async getRecentOrders(req: Request, res: Response): Promise<void> {
    try {
      const userId = 'user-1';
      const limit = parseInt(req.query.limit as string) || 3;
      
      const orders = await this.profileService.getRecentOrders(userId, limit);
      res.json(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  }
}
