import { Router } from 'express';
import { authRoutes } from '../features/auth';
import { emailVerificationRoutes } from '../features/emailVerification';
import { referralRoutes } from '../features/referral';

const router = Router();

router.use('/auth', authRoutes);
router.use('/email-verification', emailVerificationRoutes);
router.use('/referral', referralRoutes);

export default router;
