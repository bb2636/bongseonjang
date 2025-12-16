import { Router } from 'express';
import { InquiryController } from '../controller/InquiryController';
import { InquiryService } from '../application/InquiryService';
import { TypeORMInquiryRepository } from '../repository/TypeORMInquiryRepository';

const router = Router();

const inquiryRepository = new TypeORMInquiryRepository();
const inquiryService = new InquiryService(inquiryRepository);
const inquiryController = new InquiryController(inquiryService);

router.get('/', (req, res) => inquiryController.getInquiries(req, res));
router.get('/:id', (req, res) => inquiryController.getInquiryById(req, res));
router.post('/:id/answer', (req, res) => inquiryController.answerInquiry(req, res));
router.delete('/:id/answer', (req, res) => inquiryController.deleteAnswer(req, res));

export default router;
