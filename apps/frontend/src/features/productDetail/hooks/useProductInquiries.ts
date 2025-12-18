import { useQuery } from '@tanstack/react-query';
import { fetchProductInquiries } from '../api/productDetailApi';
import type { ProductInquiry } from '../types/productInquiry';

export function useProductInquiries(productId: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['productInquiries', productId],
    queryFn: () => fetchProductInquiries(productId),
    enabled: !!productId,
    staleTime: 2 * 60 * 1000,
  });

  const inquiries: ProductInquiry[] = data || [];

  return { inquiries, isLoading, error };
}
