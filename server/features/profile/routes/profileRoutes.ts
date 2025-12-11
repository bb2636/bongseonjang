import { Router } from 'express';
import { ProfileController } from '../controller/ProfileController';
import { ProfileService } from '../application/ProfileService';
import { RealProfileRepository } from '../repository/RealProfileRepository';
import { authMiddleware } from '../../../common/middleware/authMiddleware';

const router = Router();

const profileRepository = new RealProfileRepository();
const profileService = new ProfileService(profileRepository);
const profileController = new ProfileController(profileService);

router.get('/', authMiddleware, (req, res) => profileController.getProfile(req, res));
router.get('/orders', authMiddleware, (req, res) => profileController.getRecentOrders(req, res));
router.post('/verify-password', authMiddleware, (req, res) => profileController.verifyPassword(req, res));

export default router;
