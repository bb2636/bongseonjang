import { Router } from 'express';
import { PointController } from '../controller/PointController';
import { PointService } from '../application/PointService';
import { PointRepository } from '../repository/PointRepository';
import { authMiddleware } from '../../../common/middleware/authMiddleware';

const router = Router();

const pointRepository = new PointRepository();
const pointService = new PointService(pointRepository);
const pointController = new PointController(pointService);

router.get('/wallet', authMiddleware, (req, res) => pointController.getWallet(req, res));
router.get('/transactions', authMiddleware, (req, res) => pointController.getTransactions(req, res));

export default router;
