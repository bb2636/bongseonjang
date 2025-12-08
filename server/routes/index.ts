import { Router } from 'express';
import authRoutes from './authRoutes';
import emailVerificationRoutes from './emailVerificationRoutes';
import referralRoutes from './referralRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/email-verification', emailVerificationRoutes);
router.use('/referral', referralRoutes);

export default router;
