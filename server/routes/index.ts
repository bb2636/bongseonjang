import { Router } from 'express';
import { authRoutes } from '../features/auth';
import { emailVerificationRoutes } from '../features/emailVerification';
import { referralRoutes } from '../features/referral';
import { heroImageRoutes } from '../features/home';
import { timeDealRoutes } from '../features/timeDeal';

const router = Router();

router.use('/auth', authRoutes);
router.use('/email-verification', emailVerificationRoutes);
router.use('/referral', referralRoutes);
router.use('/home', heroImageRoutes);
router.use('/time-deals', timeDealRoutes);

export default router;
