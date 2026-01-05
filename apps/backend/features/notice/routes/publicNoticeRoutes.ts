import { Router } from 'express';
import type { Request, Response } from 'express';
import { NoticeService } from '../application/NoticeService';
import { TypeORMNoticeRepository } from '../repository/TypeORMNoticeRepository';

const router = Router();

const noticeRepository = new TypeORMNoticeRepository();
const noticeService = new NoticeService(noticeRepository);

router.get('/', async (req: Request, res: Response) => {
  try {
    const keyword = req.query.keyword as string | undefined;
    const result = await noticeService.getNotices(keyword);
    res.json(result);
  } catch (error) {
    console.error('Error fetching notices:', error);
    res.status(500).json({ error: 'Failed to fetch notices' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid notice ID' });
      return;
    }

    const notice = await noticeService.getNoticeById(id);
    if (!notice) {
      res.status(404).json({ error: 'Notice not found' });
      return;
    }

    res.json(notice);
  } catch (error) {
    console.error('Error fetching notice:', error);
    res.status(500).json({ error: 'Failed to fetch notice' });
  }
});

export default router;
