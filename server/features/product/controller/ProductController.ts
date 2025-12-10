import type { Request, Response } from 'express';
import type { ProductService } from '../application/ProductService';
import type { ProductFilter } from '../repository/ProductRepository';

export class ProductController {
  constructor(private readonly productService: ProductService) {}

  async getProductsByDisplayCategory(req: Request, res: Response): Promise<void> {
    try {
      const { category } = req.params;
      const { productCategory } = req.query;
      
      const filter: ProductFilter = {};
      if (productCategory && typeof productCategory === 'string') {
        filter.productCategory = productCategory;
      }

      const products = await this.productService.getProductsByDisplayCategory(category, filter);
      res.json(products);
    } catch (error) {
      console.error('Error fetching products by category:', error);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  }

  async getAllProducts(req: Request, res: Response): Promise<void> {
    try {
      const { productCategory } = req.query;
      
      const filter: ProductFilter = {};
      if (productCategory && typeof productCategory === 'string') {
        filter.productCategory = productCategory;
      }

      const products = await this.productService.getAllProducts(filter);
      res.json(products);
    } catch (error) {
      console.error('Error fetching all products:', error);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  }

  async getProductById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const product = await this.productService.getProductById(id);
      
      if (!product) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }

      res.json(product);
    } catch (error) {
      console.error('Error fetching product by id:', error);
      res.status(500).json({ error: 'Failed to fetch product' });
    }
  }
}
