import { Router } from 'express';
import { InvestmentInfoController } from '../controller/InvestmentInfoController';
import { InvestmentInfoService } from '../application/InvestmentInfoService';
import { TypeORMInvestmentInfoRepository } from '../repository/TypeORMInvestmentInfoRepository';
import { TypeORMInvestmentInfoTypeRepository } from '../repository/TypeORMInvestmentInfoTypeRepository';

const router = Router();

const investmentInfoRepository = new TypeORMInvestmentInfoRepository();
const investmentInfoTypeRepository = new TypeORMInvestmentInfoTypeRepository();
const investmentInfoService = new InvestmentInfoService(investmentInfoRepository);
const investmentInfoController = new InvestmentInfoController(investmentInfoService);

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

router.get('/', (req, res) => investmentInfoController.getInvestmentInfos(req, res));
router.get('/:id', (req, res) => investmentInfoController.getInvestmentInfoById(req, res));
router.post('/', (req, res) => investmentInfoController.createInvestmentInfo(req, res));
router.put('/:id', (req, res) => investmentInfoController.updateInvestmentInfo(req, res));
router.delete('/:id', (req, res) => investmentInfoController.deleteInvestmentInfo(req, res));

export default router;
