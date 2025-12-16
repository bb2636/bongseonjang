import { Router } from 'express';
import { BestProductController } from '../controller/BestProductController';
import { repositories } from '../../../config/repositories';

const router = Router();
const controller = new BestProductController(repositories.bestProduct);

router.get('/', (req, res) => controller.getBestProducts(req, res));

export default router;
