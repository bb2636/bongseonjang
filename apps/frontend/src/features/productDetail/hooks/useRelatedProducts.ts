import { useQuery } from '@tanstack/react-query';
import { fetchRelatedProducts, type RelatedProduct } from '../api/productDetailApi';

export function useRelatedProducts(productId: string, limit: number = 4) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['relatedProducts', productId, limit],
    queryFn: () => fetchRelatedProducts(productId, limit),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    relatedProducts: data || [] as RelatedProduct[],
    isLoading,
    error,
  };
}
