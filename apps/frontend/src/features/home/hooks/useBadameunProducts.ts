import { useQuery } from '@tanstack/react-query';
import { fetchBadameunProducts } from '../api/badameunApi';
import type { BadameunProduct } from '../types/badameun';

const QUERY_KEY = ['badameunProducts'];
const STALE_TIME = 5 * 60 * 1000;

export function useBadameunProducts() {
  const { data, isLoading, error } = useQuery<BadameunProduct[]>({
    queryKey: QUERY_KEY,
    queryFn: fetchBadameunProducts,
    staleTime: STALE_TIME,
  });

  return {
    badameunProducts: data ?? [],
    isLoading,
    error,
  };
}
