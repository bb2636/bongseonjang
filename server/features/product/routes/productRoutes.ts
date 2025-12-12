import { Router } from 'express';
import { ProductController } from '../controller/ProductController';
import { ProductService } from '../application/ProductService';
import { TypeORMProductRepository } from '../repository/TypeORMProductRepository';
import { ReviewService, TypeORMReviewRepository } from '../../review';

const router = Router();

const productRepository = new TypeORMProductRepository();
const reviewRepository = new TypeORMReviewRepository();
const reviewService = new ReviewService(reviewRepository);
const productService = new ProductService(productRepository, reviewService);
const productController = new ProductController(productService);

router.get('/time-deals', (req, res) => productController.getTimeDeals(req, res));
router.get('/fresh', (req, res) => productController.getFreshProducts(req, res));
router.get('/tag/:tag', (req, res) => productController.getProductsByTag(req, res));
router.get('/category/:category', (req, res) => productController.getProductsByDisplayCategory(req, res));
router.get('/:id/related', (req, res) => productController.getRelatedProducts(req, res));
router.get('/:id', (req, res) => productController.getProductById(req, res));
router.get('/', (req, res) => productController.getAllProducts(req, res));

export default router;
