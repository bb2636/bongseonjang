import { Router } from 'express';
import { BottomBannerController } from '../controller/BottomBannerController';
import { BottomBannerService } from '../application/BottomBannerService';
import { repositories } from '../../../config/repositories';

const router = Router();

const service = new BottomBannerService(repositories.bottomBanner);
const controller = new BottomBannerController(service);

router.get('/', (req, res) => controller.getBottomBanners(req, res));

export default router;
