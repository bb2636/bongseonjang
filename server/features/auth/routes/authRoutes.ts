import { Router } from 'express';
import { AuthController } from '../controller/AuthController';
import { authMiddleware } from '../../../common/middleware/authMiddleware';

const router = Router();
const authController = new AuthController();

router.post('/register', (req, res) => authController.register(req, res));
router.post('/login', (req, res) => authController.login(req, res));
router.get('/me', authMiddleware, (req, res) => authController.me(req, res));

router.post('/social/:provider', (req, res) => authController.socialLogin(req, res));
router.post('/social/complete', (req, res) => authController.completeSocialLogin(req, res));

router.get('/social/accounts', authMiddleware, (req, res) => authController.getLinkedAccounts(req, res));
router.delete('/social/:provider', authMiddleware, (req, res) => authController.unlinkAccount(req, res));

export default router;
