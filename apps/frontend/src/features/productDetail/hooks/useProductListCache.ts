import { useQueryClient } from '@tanstack/react-query';
import type { ProductCardData } from '@/components/ProductCard';
import type { ProductDetail } from '../types/productDetail';

export function useProductListCache() {
  const queryClient = useQueryClient();

  const primeProductDetailCache = (products: ProductCardData[]) => {
    products.forEach((product) => {
      const productIdStr = String(product.id);
      const existingData = queryClient.getQueryData<ProductDetail>(['product', productIdStr]);
      
      if (!existingData) {
        const partialDetail: Partial<ProductDetail> = {
          id: product.id,
          name: product.name,
          thumbnailUrl: product.imageUrl,
          basePrice: product.originalPrice,
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
  };

  const getPartialProductData = (productId: string): Partial<ProductDetail> | undefined => {
    return queryClient.getQueryData(['product', String(productId), 'partial']);
  };

  return {
    primeProductDetailCache,
    getPartialProductData,
  };
}
