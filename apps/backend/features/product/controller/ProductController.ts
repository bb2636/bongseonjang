import type { Request, Response } from 'express';
import type { ProductService } from '../application/ProductService.js';
import type { ProductFilter, SortBy } from '../repository/ProductRepository.js';

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
      const { productCategory, search, sortBy } = req.query;
      
      const filter: ProductFilter = {};
      if (productCategory && typeof productCategory === 'string') {
        filter.productCategory = productCategory;
      }
      if (search && typeof search === 'string') {
        filter.search = search;
      }
      if (sortBy && typeof sortBy === 'string') {
        const validSortOptions: SortBy[] = ['default', 'bestSelling', 'priceAsc', 'priceDesc', 'ratingDesc', 'reviewDesc', 'newest'];
        if (validSortOptions.includes(sortBy as SortBy)) {
          filter.sortBy = sortBy as SortBy;
        }
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

  async getRelatedProducts(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 4;
      
      const products = await this.productService.getRelatedProducts(id, limit);
      res.json(products);
    } catch (error) {
      console.error('Error fetching related products:', error);
      res.status(500).json({ error: 'Failed to fetch related products' });
    }
  }

  async getTimeDeals(req: Request, res: Response): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const products = await this.productService.getTimeDeals(limit);
      res.json(products);
    } catch (error) {
      console.error('Error fetching time deals:', error);
      res.status(500).json({ error: 'Failed to fetch time deals' });
    }
  }

  async getProductsByTag(req: Request, res: Response): Promise<void> {
    try {
      const { tag } = req.params;
      const { productCategory, limit: limitQuery } = req.query;
      const limit = limitQuery ? parseInt(limitQuery as string, 10) : 100;
      
      const filter: ProductFilter = {};
      if (productCategory && typeof productCategory === 'string') {
        filter.productCategory = productCategory;
      }
      
      const products = await this.productService.getProductsByTag(tag, limit, filter);
      res.json(products);
    } catch (error) {
      console.error('Error fetching products by tag:', error);
      res.status(500).json({ error: 'Failed to fetch products by tag' });
    }
  }

  async getFreshProducts(req: Request, res: Response): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const { productCategory } = req.query;
      
      const filter: ProductFilter = {};
      if (productCategory && typeof productCategory === 'string') {
        filter.productCategory = productCategory;
      }
      
      const products = await this.productService.getFreshProducts(limit, filter);
      res.json(products);
    } catch (error) {
      console.error('Error fetching fresh products:', error);
      res.status(500).json({ error: 'Failed to fetch fresh products' });
    }
  }
}
