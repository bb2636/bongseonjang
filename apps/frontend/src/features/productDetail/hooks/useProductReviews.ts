import { useQuery } from '@tanstack/react-query';
import type { Review } from '../types/productDetail';

async function fetchProductReviews(productId: string): Promise<Review[]> {
  const response = await fetch(`/api/reviews/product/${productId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch reviews');
  }
  return response.json();
}

export function useProductReviews(productId: string) {
  const { data: reviews = [], isLoading, error } = useQuery({
    queryKey: ['productReviews', productId],
    queryFn: () => fetchProductReviews(productId),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    reviews,
    isLoading,
    error,
  };
}
