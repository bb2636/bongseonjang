import { Router } from 'express';
import { AuthController } from '../controller/AuthController';
import { authMiddleware } from '../../../common/middleware/authMiddleware';

const router = Router();
const authController = new AuthController();

router.post('/register', (req, res) => authController.register(req, res));
router.post('/check-email', (req, res) => authController.checkEmail(req, res));
router.post('/login', (req, res) => authController.login(req, res));
router.post('/admin/login', (req, res) => authController.adminLogin(req, res));
router.get('/me', authMiddleware, (req, res) => authController.me(req, res));

router.post('/social/:provider', (req, res) => authController.socialLogin(req, res));
router.post('/social/complete', (req, res) => authController.completeSocialLogin(req, res));
router.post('/apple/callback', (req, res) => authController.appleCallback(req, res));
router.post('/social/complete-profile', authMiddleware, (req, res) => authController.completeSocialProfile(req, res));

router.get('/social/accounts', authMiddleware, (req, res) => authController.getLinkedAccounts(req, res));
router.delete('/social/:provider', authMiddleware, (req, res) => authController.unlinkAccount(req, res));

router.post('/phone/send-code', (req, res) => authController.sendPhoneVerificationCode(req, res));
router.post('/phone/verify-code', (req, res) => authController.verifyPhoneCode(req, res));

export default router;
