import { Request, Response } from 'express';
import { AdminCouponService } from './AdminCouponService';

export class AdminCouponController {
  private service: AdminCouponService;

  constructor() {
    this.service = new AdminCouponService();
  }

  async getCoupons(req: Request, res: Response): Promise<void> {
    try {
      const { search, discountType, page = '1', limit = '20' } = req.query;
      
      const result = await this.service.getCoupons({
        search: search as string | undefined,
        discountType: discountType as string | undefined,
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
      });

      res.json(result);
    } catch (error) {
      console.error('Admin get coupons error:', error);
      res.status(500).json({ error: '쿠폰 목록을 불러오는데 실패했습니다' });
    }
  }

  async getCouponById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        res.status(400).json({ error: '잘못된 쿠폰 ID입니다' });
        return;
      }

      const coupon = await this.service.getCouponById(id);
      
      if (!coupon) {
        res.status(404).json({ error: '쿠폰을 찾을 수 없습니다' });
        return;
      }

      res.json(coupon);
    } catch (error) {
      console.error('Admin get coupon by id error:', error);
      res.status(500).json({ error: '쿠폰을 불러오는데 실패했습니다' });
    }
  }

  async createCoupon(req: Request, res: Response): Promise<void> {
    try {
      const couponData = req.body;
      const coupon = await this.service.createCoupon(couponData);
      res.status(201).json(coupon);
    } catch (error) {
      console.error('Admin create coupon error:', error);
      res.status(500).json({ error: '쿠폰 생성에 실패했습니다' });
    }
  }

  async updateCoupon(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        res.status(400).json({ error: '잘못된 쿠폰 ID입니다' });
        return;
      }

      const couponData = req.body;
      const coupon = await this.service.updateCoupon(id, couponData);
      
      if (!coupon) {
        res.status(404).json({ error: '쿠폰을 찾을 수 없습니다' });
        return;
      }

      res.json(coupon);
    } catch (error) {
      console.error('Admin update coupon error:', error);
      res.status(500).json({ error: '쿠폰 수정에 실패했습니다' });
    }
  }

  async deleteCoupon(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        res.status(400).json({ error: '잘못된 쿠폰 ID입니다' });
        return;
      }

      const success = await this.service.deleteCoupon(id);
      
      if (!success) {
        res.status(404).json({ error: '쿠폰을 찾을 수 없습니다' });
        return;
      }

      res.json({ success: true, message: '쿠폰이 삭제되었습니다' });
    } catch (error) {
      console.error('Admin delete coupon error:', error);
      res.status(500).json({ error: '쿠폰 삭제에 실패했습니다' });
    }
  }

  async toggleCouponStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        res.status(400).json({ error: '잘못된 쿠폰 ID입니다' });
        return;
      }

      const coupon = await this.service.toggleCouponStatus(id);
      
      if (!coupon) {
        res.status(404).json({ error: '쿠폰을 찾을 수 없습니다' });
        return;
      }

      res.json(coupon);
    } catch (error) {
      console.error('Admin toggle coupon status error:', error);
      res.status(500).json({ error: '쿠폰 상태 변경에 실패했습니다' });
    }
  }
}

export const adminCouponController = new AdminCouponController();
