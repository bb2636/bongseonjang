import { Router } from 'express';
import { OrderHistoryController } from '../controller/OrderHistoryController';
import { OrderHistoryService } from '../application/OrderHistoryService';
import { RealOrderHistoryRepository } from '../repository/RealOrderHistoryRepository';
import { authMiddleware } from '../../../common/middleware/authMiddleware';

const router = Router();

const orderHistoryRepository = new RealOrderHistoryRepository();
const orderHistoryService = new OrderHistoryService(orderHistoryRepository);
const orderHistoryController = new OrderHistoryController(orderHistoryService);

router.get('/', authMiddleware, (req, res) => orderHistoryController.getOrderHistory(req, res));

export default router;
