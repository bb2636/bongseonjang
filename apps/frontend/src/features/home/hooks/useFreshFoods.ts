import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchFreshFoods } from '../api/freshFoodApi';
import type { FreshFood } from '../types/freshFood';
import { useProductListCache } from '../../productDetail/hooks/useProductListCache';

const QUERY_KEY = ['freshFoods'];
const STALE_TIME = 5 * 60 * 1000;

export function useFreshFoods() {
  const { primeCache } = useProductListCache();
  const { data, isLoading, error } = useQuery<FreshFood[]>({
    queryKey: QUERY_KEY,
    queryFn: fetchFreshFoods,
    staleTime: STALE_TIME,
  });

  useEffect(() => {
    if (data && data.length > 0) {
      primeCache(data);
    }
  }, [data, primeCache]);

  return {
    freshFoods: data ?? [],
    isLoading,
    error,
  };
}
