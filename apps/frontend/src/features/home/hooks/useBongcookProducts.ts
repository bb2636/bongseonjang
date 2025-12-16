import { useQuery } from '@tanstack/react-query';
import { fetchBongcookProducts } from '../api/bongcookApi';
import type { BongcookProduct } from '../types/bongcook';

const QUERY_KEY = ['bongcookProducts'];
const STALE_TIME = 5 * 60 * 1000;

export function useBongcookProducts() {
  const { data, isLoading, error } = useQuery<BongcookProduct[]>({
    queryKey: QUERY_KEY,
    queryFn: fetchBongcookProducts,
    staleTime: STALE_TIME,
  });

  return {
    bongcookProducts: data ?? [],
    isLoading,
    error,
  };
}
