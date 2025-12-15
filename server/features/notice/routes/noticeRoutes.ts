import { Router } from 'express';
import { NoticeController } from '../controller/NoticeController';
import { NoticeService } from '../application/NoticeService';
import { TypeORMNoticeRepository } from '../repository/TypeORMNoticeRepository';
import { TypeORMNoticeTypeRepository } from '../repository/TypeORMNoticeTypeRepository';

const router = Router();

const noticeRepository = new TypeORMNoticeRepository();
const noticeTypeRepository = new TypeORMNoticeTypeRepository();
const noticeService = new NoticeService(noticeRepository);
const noticeController = new NoticeController(noticeService);

router.get('/types', async (req, res) => {
  try {
    const types = await noticeTypeRepository.findAll();
    res.json(types.map(t => ({
      id: Number(t.id),
      code: t.code,
      name: t.name,
    })));
  } catch (error) {
    console.error('Error fetching notice types:', error);
    res.status(500).json({ error: 'Failed to fetch notice types' });
  }
});

router.get('/', (req, res) => noticeController.getNotices(req, res));
router.get('/:id', (req, res) => noticeController.getNoticeById(req, res));
router.post('/', (req, res) => noticeController.createNotice(req, res));
router.put('/:id', (req, res) => noticeController.updateNotice(req, res));
router.delete('/:id', (req, res) => noticeController.deleteNotice(req, res));

export default router;
