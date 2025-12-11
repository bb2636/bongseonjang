import { Response } from 'express';
import { ProfileService } from '../application/ProfileService';
import { AuthenticatedRequest } from '../../../common/middleware/authMiddleware';

export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

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

  async getRecentOrders(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const limit = parseInt(req.query.limit as string) || 3;
      
      const orders = await this.profileService.getRecentOrders(userId, limit);
      res.json(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  }

  async verifyPassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { password } = req.body;
      
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (!password) {
        res.status(400).json({ error: '비밀번호를 입력해주세요' });
        return;
      }

      const isValid = await this.profileService.verifyPassword(userId, password);
      
      if (!isValid) {
        res.status(400).json({ error: '비밀번호가 일치하지 않습니다' });
        return;
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error verifying password:', error);
      res.status(500).json({ error: '비밀번호 확인에 실패했습니다' });
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { name, phone, address, addressDetail, newPassword } = req.body;
      
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (!name || !name.trim()) {
        res.status(400).json({ error: '성함을 입력해주세요' });
        return;
      }

      await this.profileService.updateProfile(userId, {
        name: name.trim(),
        phone,
        address,
        addressDetail,
        newPassword,
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ error: '프로필 수정에 실패했습니다' });
    }
  }
}
