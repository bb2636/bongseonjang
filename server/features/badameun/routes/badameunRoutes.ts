import { Router } from 'express';
import { BadameunController } from '../controller/BadameunController';
import { BadameunService } from '../application/BadameunService';
import { repositories } from '../../../config/repositories';

const router = Router();

const badameunService = new BadameunService(repositories.badameun);
const badameunController = new BadameunController(badameunService);

router.get('/badameun-products', badameunController.getBadameunProducts);

export default router;
