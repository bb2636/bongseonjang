import { Router } from 'express';
import { NoticeController } from '../controller/NoticeController';
import { NoticeService } from '../application/NoticeService';
import { TypeORMNoticeRepository } from '../repository/TypeORMNoticeRepository';

const router = Router();

const noticeRepository = new TypeORMNoticeRepository();
const noticeService = new NoticeService(noticeRepository);
const noticeController = new NoticeController(noticeService);

router.get('/', (req, res) => noticeController.getNotices(req, res));
router.get('/:id', (req, res) => noticeController.getNoticeById(req, res));
router.post('/', (req, res) => noticeController.createNotice(req, res));
router.put('/:id', (req, res) => noticeController.updateNotice(req, res));
router.delete('/:id', (req, res) => noticeController.deleteNotice(req, res));

export default router;
