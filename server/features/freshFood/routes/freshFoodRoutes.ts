import { Router } from 'express';
import { FreshFoodController } from '../controller/FreshFoodController';
import { repositories } from '../../../config/repositories';

const router = Router();
const controller = new FreshFoodController(repositories.freshFood);

router.get('/', (req, res) => controller.getFreshFoods(req, res));

export default router;
