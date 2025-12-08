import { Router } from 'express';
import authRoutes from './authRoutes';
import emailVerificationRoutes from './emailVerificationRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/email-verification', emailVerificationRoutes);

export default router;
