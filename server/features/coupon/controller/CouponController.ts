import { Request, Response } from 'express';
import { CouponService } from '../application/CouponService';

interface AuthRequest extends Request {
  userId?: string;
}

export class CouponController {
  private service: CouponService;

  constructor() {
    this.service = new CouponService();
  }

  async getCoupons(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: '인증이 필요합니다' });
        return;
      }

      const result = await this.service.getCouponsForUser(userId);
      res.json(result);
    } catch (error) {
      console.error('Get coupons error:', error);
      res.status(500).json({ error: '쿠폰 목록을 불러오는데 실패했습니다' });
    }
  }

  async issueCoupon(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { couponId } = req.params;

      if (!userId) {
        res.status(401).json({ error: '인증이 필요합니다' });
        return;
      }

      const result = await this.service.issueCoupon(couponId, userId);

      if (!result.success) {
        res.status(400).json({ error: result.message });
        return;
      }

      res.json({ success: true, message: result.message });
    } catch (error) {
      console.error('Issue coupon error:', error);
      res.status(500).json({ error: '쿠폰 발급에 실패했습니다' });
    }
  }

  async getMyCoupons(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: '인증이 필요합니다' });
        return;
      }

      const coupons = await this.service.getMyCoupons(userId);
      res.json({ coupons, totalCount: coupons.length });
    } catch (error) {
      console.error('Get my coupons error:', error);
      res.status(500).json({ error: '보유 쿠폰 목록을 불러오는데 실패했습니다' });
    }
  }
}
