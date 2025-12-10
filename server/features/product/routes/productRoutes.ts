import { Router } from 'express';
import { ProductController } from '../controller/ProductController';
import { ProductService } from '../application/ProductService';
import { TypeORMProductRepository } from '../repository/TypeORMProductRepository';

const router = Router();

const productRepository = new TypeORMProductRepository();
const productService = new ProductService(productRepository);
const productController = new ProductController(productService);

router.get('/category/:category', (req, res) => productController.getProductsByDisplayCategory(req, res));
router.get('/', (req, res) => productController.getAllProducts(req, res));

export default router;
