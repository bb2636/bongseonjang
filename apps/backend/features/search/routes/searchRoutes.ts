import { Router } from 'express';
import { SearchController } from '../controller/SearchController';
import { SearchService } from '../application/SearchService';
import { TypeORMSearchTermRepository } from '../repository/TypeORMSearchTermRepository';

const router = Router();

const searchTermRepository = new TypeORMSearchTermRepository();
const searchService = new SearchService(searchTermRepository);
const searchController = new SearchController(searchService);

router.get('/popular', (req, res) => searchController.getPopularSearchTerms(req, res));
router.post('/record', (req, res) => searchController.recordSearch(req, res));

export default router;
