import { Router } from 'express';
import { ProfileController } from '../controller/ProfileController.js';
import { ProfileService } from '../application/ProfileService.js';
import { UserDeletionService } from '../application/UserDeletionService.js';
import { RealProfileRepository } from '../repository/RealProfileRepository.js';
import { authMiddleware } from '../../../common/middleware/authMiddleware.js';
import { AppDataSource } from '../../../config/database.js';
import { ObjectStorageService } from '../../../objectStorage.js';

const router = Router();

const profileRepository = new RealProfileRepository();
const objectStorageService = new ObjectStorageService();
const userDeletionService = new UserDeletionService(AppDataSource, objectStorageService);
const profileService = new ProfileService(profileRepository, userDeletionService);
const profileController = new ProfileController(profileService);

router.get('/', authMiddleware, (req, res) => profileController.getProfile(req, res));
router.put('/', authMiddleware, (req, res) => profileController.updateProfile(req, res));
router.get('/orders', authMiddleware, (req, res) => profileController.getRecentOrders(req, res));
router.post('/verify-password', authMiddleware, (req, res) => profileController.verifyPassword(req, res));
router.post('/withdraw', authMiddleware, (req, res) => profileController.withdrawAccount(req, res));

export default router;
