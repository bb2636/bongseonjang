import { Router } from 'express';
import { ReviewController } from '../controller/ReviewController';
import { ReviewService } from '../application/ReviewService';
import { TypeORMReviewRepository } from '../repository/TypeORMReviewRepository';
import { TypeORMReviewImageRepository } from '../repository/TypeORMReviewImageRepository';
import { TypeORMReviewableOrderItemRepository } from '../repository/TypeORMReviewableOrderItemRepository';
import { authMiddleware } from '../../../common/middleware/authMiddleware';

const router = Router();

const reviewRepository = new TypeORMReviewRepository();
const reviewImageRepository = new TypeORMReviewImageRepository();
const reviewableOrderItemRepository = new TypeORMReviewableOrderItemRepository();
const reviewService = new ReviewService(reviewRepository, reviewImageRepository, reviewableOrderItemRepository);
const reviewController = new ReviewController(reviewService);

router.get('/product/:productId', (req, res) => reviewController.getReviewsByProductId(req, res));
router.get('/product/:productId/stats', (req, res) => reviewController.getReviewStats(req, res));
router.get('/check/:productId', authMiddleware, (req, res) => reviewController.checkUserReview(req, res));
router.get('/pending', authMiddleware, (req, res) => reviewController.getPendingReviewItems(req as any, res));
router.get('/my', authMiddleware, (req, res) => reviewController.getMyReviews(req as any, res));
router.post('/', authMiddleware, (req, res) => reviewController.createReview(req, res));
router.delete('/:id', authMiddleware, (req, res) => reviewController.deleteReview(req, res));

export default router;
