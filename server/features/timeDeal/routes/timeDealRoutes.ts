import { Router } from 'express';
import { TimeDealController } from '../controller/TimeDealController';
import { repositories } from '../../../config/repositories';

const router = Router();
const controller = new TimeDealController(repositories.timeDeal);

router.get('/', (req, res) => controller.getActiveDeals(req, res));

export default router;
