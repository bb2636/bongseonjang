import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchBongcookProducts } from '../api/bongcookApi';
import type { BongcookProduct } from '../types/bongcook';
import { useProductListCache } from '../../productDetail/hooks/useProductListCache';

const QUERY_KEY = ['bongcookProducts'];
const STALE_TIME = 5 * 60 * 1000;

export function useBongcookProducts() {
  const { primeCache } = useProductListCache();
  const { data, isLoading, error } = useQuery<BongcookProduct[]>({
    queryKey: QUERY_KEY,
    queryFn: fetchBongcookProducts,
    staleTime: STALE_TIME,
  });

  useEffect(() => {
    if (data && data.length > 0) {
      primeCache(data);
    }
  }, [data, primeCache]);

  return {
    bongcookProducts: data ?? [],
    isLoading,
    error,
  };
}
