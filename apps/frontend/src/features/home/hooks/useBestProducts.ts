import { useQuery } from '@tanstack/react-query';
import { fetchBestProducts } from '../api/bestProductApi';
import type { BestProduct } from '../types/bestProduct';

const QUERY_KEY = ['bestProducts'];
const STALE_TIME = 5 * 60 * 1000;

export function useBestProducts() {
  const { data, isLoading, error } = useQuery<BestProduct[]>({
    queryKey: QUERY_KEY,
    queryFn: fetchBestProducts,
    staleTime: STALE_TIME,
  });

  return {
    bestProducts: data ?? [],
    isLoading,
    error,
  };
}
