import { Router } from 'express';
import { ProfileController } from '../controller/ProfileController';
import { ProfileService } from '../application/ProfileService';
import { MockProfileRepository } from '../repository/MockProfileRepository';

const router = Router();

const profileRepository = new MockProfileRepository();
const profileService = new ProfileService(profileRepository);
const profileController = new ProfileController(profileService);

router.get('/', (req, res) => profileController.getProfile(req, res));
router.get('/orders', (req, res) => profileController.getRecentOrders(req, res));

export default router;
