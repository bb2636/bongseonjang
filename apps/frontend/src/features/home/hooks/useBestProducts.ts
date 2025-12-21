import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchBestProducts } from '../api/bestProductApi';
import type { BestProduct } from '../types/bestProduct';
import { useProductListCache } from '../../productDetail/hooks/useProductListCache';

const QUERY_KEY = ['bestProducts'];
const STALE_TIME = 5 * 60 * 1000;

export function useBestProducts() {
  const { primeCache } = useProductListCache();
  const { data, isLoading, error } = useQuery<BestProduct[]>({
    queryKey: QUERY_KEY,
    queryFn: fetchBestProducts,
    staleTime: STALE_TIME,
  });

  useEffect(() => {
    if (data && data.length > 0) {
      primeCache(data);
    }
  }, [data, primeCache]);

  return {
    bestProducts: data ?? [],
    isLoading,
    error,
  };
}
