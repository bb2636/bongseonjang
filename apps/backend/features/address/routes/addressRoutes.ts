import { Router } from 'express';
import { AddressController } from '../controller/AddressController';
import { authMiddleware } from '../../../common/middleware/authMiddleware';

const router = Router();
const addressController = new AddressController();

router.get('/', authMiddleware, (req, res) => addressController.getAllAddresses(req, res));
router.get('/default', authMiddleware, (req, res) => addressController.getDefaultAddress(req, res));
router.post('/', authMiddleware, (req, res) => addressController.createAddress(req, res));
router.put('/:id', authMiddleware, (req, res) => addressController.updateAddress(req, res));

export { router as addressRoutes };
