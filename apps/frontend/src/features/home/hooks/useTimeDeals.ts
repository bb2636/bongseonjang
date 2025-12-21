import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTimeDeals } from '../api/timeDealApi';
import type { TimeDeal } from '../types/timeDeal';
import { useProductListCache } from '../../productDetail/hooks/useProductListCache';

const QUERY_KEY = ['timeDeals'];
const STALE_TIME = 1 * 60 * 1000;

export function useTimeDeals() {
  const { primeCache } = useProductListCache();
  const { data, isLoading, error } = useQuery<TimeDeal[]>({
    queryKey: QUERY_KEY,
    queryFn: fetchTimeDeals,
    staleTime: STALE_TIME,
  });

  useEffect(() => {
    if (data && data.length > 0) {
      primeCache(data);
    }
  }, [data, primeCache]);

  return {
    timeDeals: data ?? [],
    isLoading,
    error,
  };
}
