import { Router } from 'express';
import { CouponController } from '../controller/CouponController';
import { authMiddleware } from '../../../common/middleware/authMiddleware';

const router = Router();
const controller = new CouponController();

router.get('/', authMiddleware, (req, res) => controller.getCoupons(req, res));
router.get('/my', authMiddleware, (req, res) => controller.getMyCoupons(req, res));
router.post('/available', authMiddleware, (req, res) => controller.getAvailableCoupons(req, res));
router.post('/:couponId/issue', authMiddleware, (req, res) => controller.issueCoupon(req, res));

export default router;
