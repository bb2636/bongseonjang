import { Router } from 'express';
import { MdPickController } from '../controller/MdPickController';
import { MdPickService } from '../application/MdPickService';
import { repositories } from '../../../config/repositories';

const router = Router();

const mdPickService = new MdPickService(repositories.mdPick);
const mdPickController = new MdPickController(mdPickService);

router.get('/', (req, res) => mdPickController.getMdPicks(req, res));

export default router;
