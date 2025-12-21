import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchProductsByDisplayCategory, fetchAllProducts, type ProductFilter } from '../api/productApi';
import type { ProductCardData } from '@/components/ProductCard';
import { useProductListCache } from '../../productDetail/hooks/useProductListCache';

const STALE_TIME = 5 * 60 * 1000;

export function useProductsByCategory(displayCategoryName: string, productCategoryFilter?: string) {
  const filter: ProductFilter = {};
  if (productCategoryFilter && productCategoryFilter !== 'all') {
    filter.productCategory = productCategoryFilter;
  }

  const isAllProducts = !displayCategoryName || displayCategoryName === '';
  const { primeProductDetailCache } = useProductListCache();

  const { data, isLoading, error } = useQuery<ProductCardData[]>({
    queryKey: ['products', 'displayCategory', displayCategoryName || 'all', 'filter', productCategoryFilter ?? 'all'],
    queryFn: () => isAllProducts 
      ? fetchAllProducts(filter) 
      : fetchProductsByDisplayCategory(displayCategoryName, filter),
    staleTime: STALE_TIME,
  });

  useEffect(() => {
    if (data && data.length > 0) {
      primeProductDetailCache(data);
    }
  }, [data, primeProductDetailCache]);

  return {
    products: data ?? [],
    isLoading,
    error,
  };
}
