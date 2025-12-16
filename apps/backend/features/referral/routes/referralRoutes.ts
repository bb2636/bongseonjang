import { Router } from 'express';
import { ReferralController } from '../controller/ReferralController';

const router = Router();
const referralController = new ReferralController();

router.post('/verify', (req, res) => referralController.verifyReferralId(req, res));

export default router;
