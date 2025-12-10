import { useQuery } from '@tanstack/react-query';
import { fetchProductsByDisplayCategory, type ProductFilter } from '../api/productApi';
import type { ProductCardData } from '@/components/ProductCard';

const STALE_TIME = 5 * 60 * 1000;

export function useProductsByCategory(displayCategoryName: string, productCategoryFilter?: string) {
  const filter: ProductFilter = {};
  if (productCategoryFilter && productCategoryFilter !== 'all') {
    filter.productCategory = productCategoryFilter;
  }

  const { data, isLoading, error } = useQuery<ProductCardData[]>({
    queryKey: ['products', 'displayCategory', displayCategoryName, 'filter', productCategoryFilter ?? 'all'],
    queryFn: () => fetchProductsByDisplayCategory(displayCategoryName, filter),
    staleTime: STALE_TIME,
    enabled: !!displayCategoryName,
  });

  return {
    products: data ?? [],
    isLoading,
    error,
  };
}
