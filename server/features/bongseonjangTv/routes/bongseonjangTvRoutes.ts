import { Router } from 'express';
import { BongseonjangTvController } from '../controller/BongseonjangTvController';

const router = Router();
const controller = new BongseonjangTvController();

router.get('/', (request, response) => controller.getAll(request, response));

export default router;
