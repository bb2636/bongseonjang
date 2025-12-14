import { Router } from 'express';
import { AddressController } from '../controller/AddressController';
import { authMiddleware } from '../../../common/middleware/authMiddleware';

const router = Router();
const addressController = new AddressController();

router.get('/default', authMiddleware, (req, res) => addressController.getDefaultAddress(req, res));

export { router as addressRoutes };
