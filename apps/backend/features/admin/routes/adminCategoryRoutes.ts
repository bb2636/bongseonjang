import { Router, Request, Response } from 'express';
import { AppDataSource } from '../../../config/database';
import { ExposureCategory } from '../../../entity/ExposureCategory';
import { DisplayCategory } from '../../../entity/DisplayCategory';
import { ProductCategory } from '../../../entity/ProductCategory';
import { Product } from '../../../entity/Product';
import { ProductExposureCategory } from '../../../entity/ProductExposureCategory';

const router = Router();

router.get('/exposure-categories', async (req: Request, res: Response) => {
  try {
    const repo = AppDataSource.getRepository(ExposureCategory);
    const categories = await repo.find({ order: { sortOrder: 'ASC' } });
    return res.json(categories);
  } catch (error) {
    console.error('Failed to get exposure categories:', error);
    return res.status(500).json({ error: '노출 카테고리 목록을 불러오는데 실패했습니다' });
  }
});

router.post('/exposure-categories', async (req: Request, res: Response) => {
  try {
    const { name, sortOrder } = req.body;
    if (!name) {
      return res.status(400).json({ error: '이름은 필수입니다' });
    }
    const repo = AppDataSource.getRepository(ExposureCategory);
    const category = repo.create({ name, sortOrder: sortOrder ?? 0 });
    const saved = await repo.save(category);
    return res.status(201).json(saved);
  } catch (error) {
    console.error('Failed to create exposure category:', error);
    return res.status(500).json({ error: '노출 카테고리 생성에 실패했습니다' });
  }
});

router.put('/exposure-categories/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, sortOrder } = req.body;
    const repo = AppDataSource.getRepository(ExposureCategory);
    const category = await repo.findOne({ where: { id: Number(id) } });
    if (!category) {
      return res.status(404).json({ error: '노출 카테고리를 찾을 수 없습니다' });
    }
    if (name !== undefined) category.name = name;
    if (sortOrder !== undefined) category.sortOrder = sortOrder;
    const saved = await repo.save(category);
    return res.json(saved);
  } catch (error) {
    console.error('Failed to update exposure category:', error);
    return res.status(500).json({ error: '노출 카테고리 수정에 실패했습니다' });
  }
});

router.delete('/exposure-categories/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pecRepo = AppDataSource.getRepository(ProductExposureCategory);
    const linkedCount = await pecRepo.count({ where: { exposureCategoryId: Number(id) } });
    if (linkedCount > 0) {
      return res.status(400).json({ error: '연결된 상품이 있어 삭제할 수 없습니다' });
    }
    const repo = AppDataSource.getRepository(ExposureCategory);
    const category = await repo.findOne({ where: { id: Number(id) } });
    if (!category) {
      return res.status(404).json({ error: '노출 카테고리를 찾을 수 없습니다' });
    }
    await repo.remove(category);
    return res.json({ message: '삭제되었습니다' });
  } catch (error) {
    console.error('Failed to delete exposure category:', error);
    return res.status(500).json({ error: '노출 카테고리 삭제에 실패했습니다' });
  }
});

router.get('/display-categories', async (req: Request, res: Response) => {
  try {
    const repo = AppDataSource.getRepository(DisplayCategory);
    const categories = await repo.find({ order: { sortOrder: 'ASC' } });
    const result = categories.map((cat) => ({ ...cat, productCount: 0 }));
    return res.json(result);
  } catch (error) {
    console.error('Failed to get display categories:', error);
    return res.status(500).json({ error: '전시 카테고리 목록을 불러오는데 실패했습니다' });
  }
});

router.post('/display-categories', async (req: Request, res: Response) => {
  try {
    const { name, sortOrder, isActive } = req.body;
    if (!name) {
      return res.status(400).json({ error: '이름은 필수입니다' });
    }
    const repo = AppDataSource.getRepository(DisplayCategory);
    const category = repo.create({
      name,
      sortOrder: sortOrder ?? 0,
      isActive: isActive ?? true,
    });
    const saved = await repo.save(category);
    return res.status(201).json(saved);
  } catch (error) {
    console.error('Failed to create display category:', error);
    return res.status(500).json({ error: '전시 카테고리 생성에 실패했습니다' });
  }
});

router.put('/display-categories/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, sortOrder, isActive } = req.body;
    const repo = AppDataSource.getRepository(DisplayCategory);
    const category = await repo.findOne({ where: { id } });
    if (!category) {
      return res.status(404).json({ error: '전시 카테고리를 찾을 수 없습니다' });
    }
    if (name !== undefined) category.name = name;
    if (sortOrder !== undefined) category.sortOrder = sortOrder;
    if (isActive !== undefined) category.isActive = isActive;
    const saved = await repo.save(category);
    return res.json(saved);
  } catch (error) {
    console.error('Failed to update display category:', error);
    return res.status(500).json({ error: '전시 카테고리 수정에 실패했습니다' });
  }
});

router.delete('/display-categories/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const repo = AppDataSource.getRepository(DisplayCategory);
    const category = await repo.findOne({ where: { id } });
    if (!category) {
      return res.status(404).json({ error: '전시 카테고리를 찾을 수 없습니다' });
    }
    await repo.remove(category);
    return res.json({ message: '삭제되었습니다' });
  } catch (error) {
    console.error('Failed to delete display category:', error);
    return res.status(500).json({ error: '전시 카테고리 삭제에 실패했습니다' });
  }
});

router.get('/product-categories', async (req: Request, res: Response) => {
  try {
    const repo = AppDataSource.getRepository(ProductCategory);
    const productRepo = AppDataSource.getRepository(Product);
    const categories = await repo.find({ order: { sortOrder: 'ASC' } });
    const result = await Promise.all(
      categories.map(async (cat) => {
        const productCount = await productRepo.count({
          where: { productCategoryId: cat.id },
        });
        return { ...cat, productCount };
      })
    );
    return res.json(result);
  } catch (error) {
    console.error('Failed to get product categories:', error);
    return res.status(500).json({ error: '상품 카테고리 목록을 불러오는데 실패했습니다' });
  }
});

router.post('/product-categories', async (req: Request, res: Response) => {
  try {
    const { name, sortOrder, isActive } = req.body;
    if (!name) {
      return res.status(400).json({ error: '이름은 필수입니다' });
    }
    const repo = AppDataSource.getRepository(ProductCategory);
    const category = repo.create({
      name,
      sortOrder: sortOrder ?? 0,
      isActive: isActive ?? true,
    });
    const saved = await repo.save(category);
    return res.status(201).json(saved);
  } catch (error) {
    console.error('Failed to create product category:', error);
    return res.status(500).json({ error: '상품 카테고리 생성에 실패했습니다' });
  }
});

router.put('/product-categories/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, sortOrder, isActive } = req.body;
    const repo = AppDataSource.getRepository(ProductCategory);
    const category = await repo.findOne({ where: { id } });
    if (!category) {
      return res.status(404).json({ error: '상품 카테고리를 찾을 수 없습니다' });
    }
    if (name !== undefined) category.name = name;
    if (sortOrder !== undefined) category.sortOrder = sortOrder;
    if (isActive !== undefined) category.isActive = isActive;
    const saved = await repo.save(category);
    return res.json(saved);
  } catch (error) {
    console.error('Failed to update product category:', error);
    return res.status(500).json({ error: '상품 카테고리 수정에 실패했습니다' });
  }
});

router.delete('/product-categories/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const productRepo = AppDataSource.getRepository(Product);
    const linkedCount = await productRepo.count({
      where: { productCategoryId: id },
    });
    if (linkedCount > 0) {
      return res.status(400).json({ error: '연결된 상품이 있어 삭제할 수 없습니다' });
    }
    const repo = AppDataSource.getRepository(ProductCategory);
    const category = await repo.findOne({ where: { id } });
    if (!category) {
      return res.status(404).json({ error: '상품 카테고리를 찾을 수 없습니다' });
    }
    await repo.remove(category);
    return res.json({ message: '삭제되었습니다' });
  } catch (error) {
    console.error('Failed to delete product category:', error);
    return res.status(500).json({ error: '상품 카테고리 삭제에 실패했습니다' });
  }
});

export { router as adminCategoryRoutes };
