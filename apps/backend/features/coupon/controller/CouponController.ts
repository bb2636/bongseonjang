import { Request, Response } from 'express';
import { CouponService } from '../application/CouponService.js';
import { AuthenticatedRequest } from '../../../common/middleware/authMiddleware.js';

type AuthRequest = AuthenticatedRequest;

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
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      res.json(result);
    } catch (error) {
      console.error('Get coupons error:', error);
      res.status(500).json({ error: '쿠폰 목록을 불러오는데 실패했습니다' });
    }
  }

  async issueCoupon(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const couponId = parseInt(req.params.couponId, 10);

      if (!userId) {
        res.status(401).json({ error: '인증이 필요합니다' });
        return;
      }

      if (isNaN(couponId)) {
        res.status(400).json({ error: '잘못된 쿠폰 ID입니다' });
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
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      res.json({ coupons, totalCount: coupons.length });
    } catch (error) {
      console.error('Get my coupons error:', error);
      res.status(500).json({ error: '보유 쿠폰 목록을 불러오는데 실패했습니다' });
    }
  }

  async getAvailableCoupons(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: '인증이 필요합니다' });
        return;
      }

      const { productIds } = req.body;
      if (!productIds || !Array.isArray(productIds)) {
        res.status(400).json({ error: '상품 정보가 필요합니다' });
        return;
      }

      const coupons = await this.service.getAvailableCouponsForProducts(userId, productIds);
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      res.json({ coupons, totalCount: coupons.length });
    } catch (error) {
      console.error('Get available coupons error:', error);
      res.status(500).json({ error: '적용 가능한 쿠폰 목록을 불러오는데 실패했습니다' });
    }
  }
}
