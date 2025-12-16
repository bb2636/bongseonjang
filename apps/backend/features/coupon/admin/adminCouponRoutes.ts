import { Router } from 'express';
import { adminCouponController } from './AdminCouponController';

const router = Router();

router.get('/coupons', (req, res) => adminCouponController.getCoupons(req, res));
router.get('/coupons/:id', (req, res) => adminCouponController.getCouponById(req, res));
router.post('/coupons', (req, res) => adminCouponController.createCoupon(req, res));
router.put('/coupons/:id', (req, res) => adminCouponController.updateCoupon(req, res));
router.delete('/coupons/:id', (req, res) => adminCouponController.deleteCoupon(req, res));
router.patch('/coupons/:id/toggle-status', (req, res) => adminCouponController.toggleCouponStatus(req, res));

export { router as adminCouponRoutes };
