import { useQuery } from '@tanstack/react-query';
import { fetchProductsByCategory } from '../api/productApi';
import type { ProductCardData } from '@/components/ProductCard';

const STALE_TIME = 5 * 60 * 1000;

export function useProductsByCategory(categoryName: string) {
  const { data, isLoading, error } = useQuery<ProductCardData[]>({
    queryKey: ['products', 'category', categoryName],
    queryFn: () => fetchProductsByCategory(categoryName),
    staleTime: STALE_TIME,
    enabled: !!categoryName,
  });

  return {
    products: data ?? [],
    isLoading,
    error,
  };
}
