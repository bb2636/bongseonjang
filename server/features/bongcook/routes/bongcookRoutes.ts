import { Router } from 'express';
import { BongcookController } from '../controller/BongcookController';

const router = Router();
const controller = new BongcookController();

router.get('/', (request, response) => controller.getAll(request, response));

export default router;
