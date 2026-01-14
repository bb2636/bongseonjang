import { Router } from 'express';
import { SearchController } from '../controller/SearchController';
import { SearchService } from '../application/SearchService';
import { TypeORMSearchTermRepository } from '../repository/TypeORMSearchTermRepository';
import { TypeORMUserSearchHistoryRepository } from '../repository/TypeORMUserSearchHistoryRepository';
import { authMiddleware } from '../../../common/middleware/authMiddleware';

const router = Router();

const searchTermRepository = new TypeORMSearchTermRepository();
const userSearchHistoryRepository = new TypeORMUserSearchHistoryRepository();
const searchService = new SearchService(searchTermRepository, userSearchHistoryRepository);
const searchController = new SearchController(searchService);

router.get('/popular', (req, res) => searchController.getPopularSearchTerms(req, res));
router.post('/record', (req, res) => searchController.recordSearch(req, res));

router.get('/history', authMiddleware, (req, res) => searchController.getUserSearchHistory(req, res));
router.post('/history', authMiddleware, (req, res) => searchController.addUserSearchHistory(req, res));
router.delete('/history', authMiddleware, (req, res) => searchController.deleteUserSearchHistory(req, res));
router.delete('/history/all', authMiddleware, (req, res) => searchController.clearUserSearchHistory(req, res));

export default router;
