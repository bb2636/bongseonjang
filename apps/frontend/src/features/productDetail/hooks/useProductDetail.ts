import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchProductDetail } from '../api/productDetailApi';
import type { ProductDetail } from '../types/productDetail';

export function useProductDetail(productId: string) {
  const queryClient = useQueryClient();
  
  const partialData = queryClient.getQueryData<Partial<ProductDetail>>(['product', productId, 'partial']);

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const fullData = await fetchProductDetail(productId);
      queryClient.removeQueries({ queryKey: ['product', productId, 'partial'] });
      return fullData;
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });

  const displayProduct = data || (partialData ? {
    ...partialData,
    options: partialData.options ?? [],
    mainOptions: partialData.mainOptions ?? [],
    subOptions: partialData.subOptions ?? [],
    images: partialData.images ?? [],
  } as ProductDetail : undefined);

  return {
    product: displayProduct,
    isLoading: isLoading && !partialData,
    isFetchingDetail: isFetching && !!partialData,
    hasPartialData: !!partialData && !data,
    isPartialOnly: !data && !!partialData,
    error,
  };
}
