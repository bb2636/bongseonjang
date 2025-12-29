import { Router } from 'express';
import { InquiryController } from '../controller/InquiryController.js';
import { InquiryService } from '../application/InquiryService.js';
import { TypeORMInquiryRepository } from '../repository/TypeORMInquiryRepository.js';
import { authMiddleware } from '../../../common/middleware/authMiddleware.js';

const router = Router();

const inquiryRepository = new TypeORMInquiryRepository();
const inquiryService = new InquiryService(inquiryRepository);
const inquiryController = new InquiryController(inquiryService);

router.get('/', (req, res) => inquiryController.getInquiries(req, res));
router.get('/:id', (req, res) => inquiryController.getInquiryById(req, res));
router.post('/:id/answer', authMiddleware, (req, res) => inquiryController.answerInquiry(req, res));
router.delete('/:id/answer', authMiddleware, (req, res) => inquiryController.deleteAnswer(req, res));

export default router;
