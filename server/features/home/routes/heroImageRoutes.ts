import { Router } from 'express';
import { HeroImageController } from '../controller/HeroImageController';
import { HeroImageApplicationService } from '../application/HeroImageApplicationService';
import { repositories } from '../../../config/repositories';

const router = Router();

const heroImageService = new HeroImageApplicationService(repositories.heroImage);
const heroImageController = new HeroImageController(heroImageService);

router.get('/hero-images', (req, res) => heroImageController.getHeroImages(req, res));

export default router;
