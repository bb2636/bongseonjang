import { Router } from 'express';
import { InvestmentInfoService } from '../application/InvestmentInfoService';
import { TypeORMInvestmentInfoRepository } from '../repository/TypeORMInvestmentInfoRepository';
import { TypeORMInvestmentInfoTypeRepository } from '../repository/TypeORMInvestmentInfoTypeRepository';

const router = Router();

const investmentInfoRepository = new TypeORMInvestmentInfoRepository();
const investmentInfoTypeRepository = new TypeORMInvestmentInfoTypeRepository();
const investmentInfoService = new InvestmentInfoService(investmentInfoRepository);

router.get('/types', async (req, res) => {
  try {
    const types = await investmentInfoTypeRepository.findAll();
    res.json(types.map(t => ({
      id: Number(t.id),
      code: t.code,
      name: t.name,
    })));
  } catch (error) {
    console.error('Error fetching investment info types:', error);
    res.status(500).json({ error: 'Failed to fetch investment info types' });
  }
});

router.get('/', async (req, res) => {
  try {
    const keyword = req.query.keyword as string | undefined;
    const result = await investmentInfoService.getInvestmentInfos(keyword);
    res.json(result);
  } catch (error) {
    console.error('Error fetching investment infos:', error);
    res.status(500).json({ error: 'Failed to fetch investment infos' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    const result = await investmentInfoService.getInvestmentInfoById(id);
    if (!result) {
      return res.status(404).json({ error: 'Investment info not found' });
    }
    res.json(result);
  } catch (error) {
    console.error('Error fetching investment info:', error);
    res.status(500).json({ error: 'Failed to fetch investment info' });
  }
});

export default router;
