import { Router } from 'express';
import { EmailVerificationController } from '../controller/EmailVerificationController';

const router = Router();
const controller = new EmailVerificationController();

router.post('/send', (req, res) => controller.sendCode(req, res));
router.post('/verify', (req, res) => controller.verifyCode(req, res));

export default router;
