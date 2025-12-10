import type { Request, Response } from 'express';
import type { ProductService } from '../application/ProductService';

export class ProductController {
  constructor(private readonly productService: ProductService) {}

  async getProductsByDisplayCategory(req: Request, res: Response): Promise<void> {
    try {
      const { category } = req.params;
      const products = await this.productService.getProductsByDisplayCategory(category);
      res.json(products);
    } catch (error) {
      console.error('Error fetching products by category:', error);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  }

  async getAllProducts(_req: Request, res: Response): Promise<void> {
    try {
      const products = await this.productService.getAllProducts();
      res.json(products);
    } catch (error) {
      console.error('Error fetching all products:', error);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  }
}
