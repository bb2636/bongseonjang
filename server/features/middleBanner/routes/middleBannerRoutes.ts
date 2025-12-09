import { Router } from 'express';
import { MiddleBannerController } from '../controller/MiddleBannerController';
import { repositories } from '../../../config/repositories';

const router = Router();
const controller = new MiddleBannerController(repositories.middleBanner);

router.get('/', (req, res) => controller.getMiddleBanners(req, res));

export default router;
