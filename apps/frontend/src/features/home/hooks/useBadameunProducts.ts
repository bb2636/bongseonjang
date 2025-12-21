import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchBadameunProducts } from '../api/badameunApi';
import type { BadameunProduct } from '../types/badameun';
import { useProductListCache } from '../../productDetail/hooks/useProductListCache';

const QUERY_KEY = ['badameunProducts'];
const STALE_TIME = 5 * 60 * 1000;

export function useBadameunProducts() {
  const { primeCache } = useProductListCache();
  const { data, isLoading, error } = useQuery<BadameunProduct[]>({
    queryKey: QUERY_KEY,
    queryFn: fetchBadameunProducts,
    staleTime: STALE_TIME,
  });

  useEffect(() => {
    if (data && data.length > 0) {
      primeCache(data);
    }
  }, [data, primeCache]);

  return {
    badameunProducts: data ?? [],
    isLoading,
    error,
  };
}
