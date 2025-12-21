import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { ProductCardData } from '@/components/ProductCard';
import type { ProductDetail } from '../types/productDetail';

interface CacheableProduct {
  id: string;
  name: string;
  imageUrl?: string;
  originalPrice?: number;
  discountPercent: number;
  discountedPrice: number;
  summary?: string;
  origin?: string;
  reviewCount?: number;
  averageRating?: number;
  mainOptions?: Array<{
    id: string;
    groupName: string;
    name: string;
    price: number;
    compareAtPrice?: number;
    stockQty: number;
    isDefault: boolean;
  }>;
}

export function useProductListCache() {
  const queryClient = useQueryClient();

  const primeCache = useCallback((products: CacheableProduct[]) => {
    products.forEach((product) => {
      const productIdStr = String(product.id);
      const existingData = queryClient.getQueryData<ProductDetail>(['product', productIdStr]);
      
      if (!existingData) {
        const basePrice = product.originalPrice ?? product.discountedPrice;
        const partialDetail: Partial<ProductDetail> = {
          id: product.id,
          name: product.name,
          thumbnailUrl: product.imageUrl,
          basePrice,
          discountRate: product.discountPercent,
          isDiscounted: product.discountPercent > 0,
          discountedPrice: product.discountedPrice,
          lowestPrice: product.discountedPrice,
          summary: product.summary,
          origin: product.origin,
          reviewCount: product.reviewCount ?? 0,
          averageRating: product.averageRating ?? 0,
          isOptionRequired: (product.mainOptions?.length ?? 0) > 0,
          options: [],
          mainOptions: product.mainOptions?.map(opt => ({
            id: opt.id,
            groupName: opt.groupName,
            name: opt.name,
            price: opt.price,
            compareAtPrice: opt.compareAtPrice,
            stockQty: opt.stockQty,
            isDefault: opt.isDefault,
          })) ?? [],
          subOptions: [],
          images: product.imageUrl ? [{
            id: 'thumb-' + product.id,
            imageUrl: product.imageUrl,
            imageType: 'THUMBNAIL' as const,
            sortOrder: 0,
            isThumbnail: true,
          }] : [],
        };

        queryClient.setQueryData(['product', productIdStr, 'partial'], partialDetail);
      }
    });
  }, [queryClient]);

  const primeProductDetailCache = useCallback((products: ProductCardData[]) => {
    primeCache(products);
  }, [primeCache]);

  const getPartialProductData = useCallback((productId: string): Partial<ProductDetail> | undefined => {
    return queryClient.getQueryData(['product', String(productId), 'partial']);
  }, [queryClient]);

  return {
    primeProductDetailCache,
    primeCache,
    getPartialProductData,
  };
}
