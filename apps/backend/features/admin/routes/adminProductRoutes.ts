import { Router, Request, Response } from 'express';
import { AppDataSource } from '../../../config/database';
import { Product } from '../../../entity/Product';
import { ProductCategory } from '../../../entity/ProductCategory';
import { ProductImage, ImageType } from '../../../entity/ProductImage';
import { ProductOption } from '../../../entity/ProductOption';
import { ExposureCategory } from '../../../entity/ExposureCategory';
import { ProductExposureCategory } from '../../../entity/ProductExposureCategory';

const router = Router();

interface AdminProductListItem {
  id: string;
  name: string;
  categoryName: string;
  basePrice: number;
  lowestPrice: number;
  optionCount: number;
  optionSummary: string;
  stockQuantity: number;
  isExposed: boolean;
  exposureCategories: string[];
  thumbnailUrl: string;
  createdAt: Date;
}

router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    const productRepository = AppDataSource.getRepository(Product);
    const categoryRepository = AppDataSource.getRepository(ProductCategory);
    const imageRepository = AppDataSource.getRepository(ProductImage);
    const optionRepository = AppDataSource.getRepository(ProductOption);
    const exposureCategoryRepository = AppDataSource.getRepository(ExposureCategory);
    const productExposureCategoryRepository = AppDataSource.getRepository(ProductExposureCategory);

    let queryBuilder = productRepository.createQueryBuilder('product');

    if (search && typeof search === 'string' && search.trim()) {
      queryBuilder = queryBuilder.where('product.name ILIKE :search', {
        search: `%${search.trim()}%`,
      });
    }

    const totalCount = await queryBuilder.getCount();

    const products = await queryBuilder
      .orderBy('product.createdAt', 'DESC')
      .skip(offset)
      .take(limitNum)
      .getMany();

    const items: AdminProductListItem[] = await Promise.all(
      products.map(async (product) => {
        const category = await categoryRepository.findOne({
          where: { id: product.productCategoryId },
        });

        const thumbnailImage = await imageRepository.findOne({
          where: { productId: product.id, isThumbnail: true },
        });

        const options = await optionRepository.find({
          where: { productId: product.id },
          order: { sortOrder: 'ASC' },
        });

        const productExposureCategories = await productExposureCategoryRepository.find({
          where: { productId: product.id },
        });

        const exposureCategories: string[] = [];
        for (const pec of productExposureCategories) {
          const ec = await exposureCategoryRepository.findOne({
            where: { id: pec.exposureCategoryId },
          });
          if (ec) {
            exposureCategories.push(ec.name);
          }
        }

        const optionPrices = options.filter(o => o.price !== null).map(o => o.price as number);
        const lowestPrice = optionPrices.length > 0
          ? Math.min(...optionPrices)
          : product.basePrice;

        const optionSummary = options.length > 0
          ? options.length === 1
            ? options[0].optionValue
            : `${options[0].optionValue} 외 ${options.length - 1}개`
          : '-';

        return {
          id: product.id,
          name: product.name,
          categoryName: category?.name || '미분류',
          basePrice: product.basePrice,
          lowestPrice,
          optionCount: options.length,
          optionSummary,
          stockQuantity: product.stockQuantity,
          isExposed: exposureCategories.length > 0,
          exposureCategories,
          thumbnailUrl: thumbnailImage?.imageUrl || '',
          createdAt: product.createdAt,
        };
      })
    );

    return res.json({
      items,
      totalCount,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalCount / limitNum),
    });
  } catch (error) {
    console.error('Failed to get admin products:', error);
    return res.status(500).json({ error: '상품 목록을 불러오는데 실패했습니다' });
  }
});

router.patch('/:productId/exposure', async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { isExposed, exposureCategoryIds } = req.body;

    const productRepository = AppDataSource.getRepository(Product);
    const productExposureCategoryRepository = AppDataSource.getRepository(ProductExposureCategory);

    const product = await productRepository.findOne({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ error: '상품을 찾을 수 없습니다' });
    }

    await productExposureCategoryRepository.delete({ productId });

    if (isExposed && Array.isArray(exposureCategoryIds) && exposureCategoryIds.length > 0) {
      for (const categoryId of exposureCategoryIds) {
        const newRelation = productExposureCategoryRepository.create({
          productId,
          exposureCategoryId: categoryId,
        });
        await productExposureCategoryRepository.save(newRelation);
      }
    }

    return res.json({ success: true, message: '노출 설정이 변경되었습니다' });
  } catch (error) {
    console.error('Failed to update product exposure:', error);
    return res.status(500).json({ error: '노출 설정 변경에 실패했습니다' });
  }
});

router.get('/exposure-categories', async (_req: Request, res: Response) => {
  try {
    const exposureCategoryRepository = AppDataSource.getRepository(ExposureCategory);
    const categories = await exposureCategoryRepository.find({
      order: { sortOrder: 'ASC' },
    });

    return res.json({ categories });
  } catch (error) {
    console.error('Failed to get exposure categories:', error);
    return res.status(500).json({ error: '노출 카테고리를 불러오는데 실패했습니다' });
  }
});

router.get('/categories', async (_req: Request, res: Response) => {
  try {
    const categoryRepository = AppDataSource.getRepository(ProductCategory);
    const categories = await categoryRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });

    return res.json({
      categories: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
      })),
    });
  } catch (error) {
    console.error('Failed to get product categories:', error);
    return res.status(500).json({ error: '카테고리를 불러오는데 실패했습니다' });
  }
});

router.get('/:productId', async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    const productRepository = AppDataSource.getRepository(Product);
    const categoryRepository = AppDataSource.getRepository(ProductCategory);
    const imageRepository = AppDataSource.getRepository(ProductImage);
    const optionRepository = AppDataSource.getRepository(ProductOption);
    const exposureCategoryRepository = AppDataSource.getRepository(ExposureCategory);
    const productExposureCategoryRepository = AppDataSource.getRepository(ProductExposureCategory);

    const product = await productRepository.findOne({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ error: '상품을 찾을 수 없습니다' });
    }

    const category = await categoryRepository.findOne({
      where: { id: product.productCategoryId },
    });

    const thumbnailImages = await imageRepository.find({
      where: { productId: product.id, imageType: ImageType.THUMBNAIL },
      order: { sortOrder: 'ASC' },
    });

    const detailImages = await imageRepository.find({
      where: { productId: product.id, imageType: ImageType.DETAIL },
      order: { sortOrder: 'ASC' },
    });

    const options = await optionRepository.find({
      where: { productId: product.id },
      order: { sortOrder: 'ASC' },
    });

    const productExposureCategories = await productExposureCategoryRepository.find({
      where: { productId: product.id },
    });

    const exposureCategoryIds = productExposureCategories.map(pec => pec.exposureCategoryId);

    let detailContent: {
      description?: string;
      caution?: string;
      productInfos?: Array<{ label: string; value: string }>;
      shippingDetails?: Array<{ label: string; value: string }>;
      shippingInfo?: {
        shippingFee: number | null;
        freeShippingThreshold: number | null;
        shippingDescription: string;
      };
    } = {};
    
    try {
      if (product.detailContent) {
        detailContent = JSON.parse(product.detailContent);
      }
    } catch {
      console.error('Failed to parse detailContent');
    }

    return res.json({
      id: product.id,
      name: product.name,
      categoryId: product.productCategoryId,
      categoryName: category?.name || '미분류',
      exposureCategoryIds,
      basePrice: product.basePrice,
      stockQuantity: product.stockQuantity,
      saleStartDate: product.saleStartDate,
      saleEndDate: product.saleEndDate,
      countdownDays: product.countdownDays,
      storageMethod: product.storageMethod || '',
      expirationInfo: product.expirationInfo || '',
      weight: product.weight || '',
      origin: product.origin || '',
      shippingMethod: product.shippingMethod || '',
      description: detailContent.description || '',
      caution: detailContent.caution || '',
      productInfos: detailContent.productInfos || [],
      shippingDetails: detailContent.shippingDetails || [],
      shippingInfo: detailContent.shippingInfo || {
        shippingFee: null,
        freeShippingThreshold: null,
        shippingDescription: '전국',
      },
      thumbnailImages: thumbnailImages.map(img => ({
        id: img.id,
        imageUrl: img.imageUrl,
        sortOrder: img.sortOrder,
      })),
      detailImages: detailImages.map(img => ({
        id: img.id,
        imageUrl: img.imageUrl,
        sortOrder: img.sortOrder,
      })),
      options: options.map(opt => ({
        id: opt.id,
        optionName: opt.optionName,
        optionValue: opt.optionValue,
        price: opt.price,
        stock: opt.stockQuantity || 0,
        sortOrder: opt.sortOrder,
      })),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    });
  } catch (error) {
    console.error('Failed to get product details:', error);
    return res.status(500).json({ error: '상품 정보를 불러오는데 실패했습니다' });
  }
});

router.put('/:productId', async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const {
      name,
      categoryId,
      exposureCategoryIds,
      basePrice,
      startDate,
      endDate,
      countdownDays,
      storageMethod,
      expirationInfo,
      weight,
      origin,
      shippingMethod,
      description,
      caution,
      options,
      productInfos,
      shippingDetails,
      shippingInfo,
      thumbnailUrls,
      detailUrls,
    } = req.body;

    if (!name || !categoryId || !basePrice) {
      return res.status(400).json({ error: '필수 필드를 입력해주세요' });
    }

    if (!exposureCategoryIds || !Array.isArray(exposureCategoryIds) || exposureCategoryIds.length === 0) {
      return res.status(400).json({ error: '노출 카테고리를 최소 1개 선택해주세요' });
    }

    const productRepository = AppDataSource.getRepository(Product);
    const optionRepository = AppDataSource.getRepository(ProductOption);
    const imageRepository = AppDataSource.getRepository(ProductImage);
    const productExposureCategoryRepository = AppDataSource.getRepository(ProductExposureCategory);

    const product = await productRepository.findOne({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ error: '상품을 찾을 수 없습니다' });
    }

    product.name = name;
    product.productCategoryId = categoryId;
    product.basePrice = basePrice;
    product.saleStartDate = startDate ? new Date(startDate) : null;
    product.saleEndDate = endDate ? new Date(endDate) : null;
    product.countdownDays = countdownDays ?? null;
    product.storageMethod = storageMethod || null;
    product.expirationInfo = expirationInfo || null;
    product.weight = weight || null;
    product.origin = origin || null;
    product.shippingMethod = shippingMethod || null;
    product.detailContent = JSON.stringify({
      description,
      caution,
      productInfos,
      shippingDetails,
      shippingInfo,
    });

    await productRepository.save(product);

    await imageRepository.delete({ productId, imageType: ImageType.THUMBNAIL });
    await imageRepository.delete({ productId, imageType: ImageType.DETAIL });

    if (Array.isArray(thumbnailUrls)) {
      for (let i = 0; i < thumbnailUrls.length; i++) {
        const image = imageRepository.create({
          productId,
          imageUrl: thumbnailUrls[i],
          imageType: ImageType.THUMBNAIL,
          isThumbnail: i === 0,
          sortOrder: i,
        });
        await imageRepository.save(image);
      }
    }

    if (Array.isArray(detailUrls)) {
      for (let i = 0; i < detailUrls.length; i++) {
        const image = imageRepository.create({
          productId,
          imageUrl: detailUrls[i],
          imageType: ImageType.DETAIL,
          isThumbnail: false,
          sortOrder: i,
        });
        await imageRepository.save(image);
      }
    }

    const existingOptions = await optionRepository.find({ where: { productId } });
    const existingOptionIds = new Set(existingOptions.map(opt => opt.id));
    const submittedOptionIds = new Set<string>();

    if (Array.isArray(options) && options.length > 0) {
      let totalStock = 0;
      for (let i = 0; i < options.length; i++) {
        const opt = options[i];
        
        if (opt.id && existingOptionIds.has(opt.id)) {
          await optionRepository.update(opt.id, {
            optionName: opt.optionName || '옵션',
            optionValue: opt.optionValue,
            price: opt.price,
            stockQuantity: opt.stock || 0,
            sortOrder: i,
          });
          submittedOptionIds.add(opt.id);
        } else {
          const option = optionRepository.create({
            productId,
            optionName: opt.optionName || '옵션',
            optionValue: opt.optionValue,
            price: opt.price,
            stockQuantity: opt.stock || 0,
            sortOrder: i,
          });
          await optionRepository.save(option);
        }
        totalStock += opt.stock || 0;
      }
      
      for (const existingOpt of existingOptions) {
        if (!submittedOptionIds.has(existingOpt.id)) {
          await optionRepository.delete({ id: existingOpt.id });
        }
      }
      
      await productRepository.update(productId, { stockQuantity: totalStock });
    } else {
      await optionRepository.delete({ productId });
      await productRepository.update(productId, { stockQuantity: 0 });
    }

    await productExposureCategoryRepository.delete({ productId });
    for (const categoryId of exposureCategoryIds) {
      const productExposureCategory = productExposureCategoryRepository.create({
        productId,
        exposureCategoryId: Number(categoryId),
      });
      await productExposureCategoryRepository.save(productExposureCategory);
    }

    return res.json({ success: true, productId });
  } catch (error) {
    console.error('Failed to update product:', error);
    return res.status(500).json({ error: '상품 수정에 실패했습니다' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      name,
      categoryId,
      exposureCategoryIds,
      basePrice,
      startDate,
      endDate,
      countdownDays,
      storageMethod,
      expirationInfo,
      weight,
      origin,
      shippingMethod,
      description,
      caution,
      options,
      productInfos,
      shippingDetails,
      shippingInfo,
      thumbnailUrls,
      detailUrls,
    } = req.body;

    if (!name || !categoryId || !basePrice) {
      return res.status(400).json({ error: '필수 필드를 입력해주세요' });
    }

    if (!exposureCategoryIds || !Array.isArray(exposureCategoryIds) || exposureCategoryIds.length === 0) {
      return res.status(400).json({ error: '노출 카테고리를 최소 1개 선택해주세요' });
    }

    const productRepository = AppDataSource.getRepository(Product);
    const optionRepository = AppDataSource.getRepository(ProductOption);
    const imageRepository = AppDataSource.getRepository(ProductImage);
    const productExposureCategoryRepository = AppDataSource.getRepository(ProductExposureCategory);

    const product = productRepository.create({
      name,
      productCategoryId: categoryId,
      basePrice,
      stockQuantity: 0,
      saleStartDate: startDate ? new Date(startDate) : null,
      saleEndDate: endDate ? new Date(endDate) : null,
      countdownDays: countdownDays ?? null,
      storageMethod: storageMethod || null,
      expirationInfo: expirationInfo || null,
      weight: weight || null,
      origin: origin || null,
      shippingMethod: shippingMethod || null,
      detailContent: JSON.stringify({
        description,
        caution,
        productInfos,
        shippingDetails,
        shippingInfo,
      }),
    });

    const savedProduct = await productRepository.save(product);

    if (Array.isArray(thumbnailUrls)) {
      for (let i = 0; i < thumbnailUrls.length; i++) {
        const image = imageRepository.create({
          productId: savedProduct.id,
          imageUrl: thumbnailUrls[i],
          imageType: ImageType.THUMBNAIL,
          isThumbnail: i === 0,
          sortOrder: i,
        });
        await imageRepository.save(image);
      }
    }

    if (Array.isArray(detailUrls)) {
      for (let i = 0; i < detailUrls.length; i++) {
        const image = imageRepository.create({
          productId: savedProduct.id,
          imageUrl: detailUrls[i],
          imageType: ImageType.DETAIL,
          isThumbnail: false,
          sortOrder: i,
        });
        await imageRepository.save(image);
      }
    }

    if (Array.isArray(options) && options.length > 0) {
      let totalStock = 0;
      for (let i = 0; i < options.length; i++) {
        const opt = options[i];
        const option = optionRepository.create({
          productId: savedProduct.id,
          optionName: opt.optionName || '옵션',
          optionValue: opt.optionValue,
          price: opt.price,
          sortOrder: i,
        });
        await optionRepository.save(option);
        totalStock += opt.stock || 0;
      }
      await productRepository.update(savedProduct.id, { stockQuantity: totalStock });
    }

    for (const catId of exposureCategoryIds) {
      const productExposureCategory = productExposureCategoryRepository.create({
        productId: savedProduct.id,
        exposureCategoryId: Number(catId),
      });
      await productExposureCategoryRepository.save(productExposureCategory);
    }

    return res.json({ success: true, productId: savedProduct.id });
  } catch (error) {
    console.error('Failed to create product:', error);
    return res.status(500).json({ error: '상품 등록에 실패했습니다' });
  }
});

router.delete('/:productId', async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    const productRepository = AppDataSource.getRepository(Product);
    const optionRepository = AppDataSource.getRepository(ProductOption);
    const imageRepository = AppDataSource.getRepository(ProductImage);
    const productExposureCategoryRepository = AppDataSource.getRepository(ProductExposureCategory);

    const product = await productRepository.findOne({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ error: '상품을 찾을 수 없습니다' });
    }

    await productExposureCategoryRepository.delete({ productId });
    await optionRepository.delete({ productId });
    await imageRepository.delete({ productId });
    await productRepository.delete({ id: productId });

    return res.json({ success: true, message: '상품이 삭제되었습니다' });
  } catch (error) {
    console.error('Failed to delete product:', error);
    return res.status(500).json({ error: '상품 삭제에 실패했습니다' });
  }
});

export { router as adminProductRoutes };
