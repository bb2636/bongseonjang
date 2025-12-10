import { useQuery } from '@tanstack/react-query';
import { fetchProductDetail } from '../api/productDetailApi';

export function useProductDetail(productId: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => fetchProductDetail(productId),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    product: data,
    isLoading,
    error,
  };
}
