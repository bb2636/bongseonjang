import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMdPicks } from '../api/mdPickApi';
import type { MdPickProduct } from '../types/mdPick';
import { useProductListCache } from '../../productDetail/hooks/useProductListCache';

const STALE_TIME = 5 * 60 * 1000;

export function useMdPicks() {
  const { primeCache } = useProductListCache();
  const { data, isLoading, error } = useQuery<MdPickProduct[]>({
    queryKey: ['mdPicks'],
    queryFn: fetchMdPicks,
    staleTime: STALE_TIME,
  });

  useEffect(() => {
    if (data && data.length > 0) {
      primeCache(data);
    }
  }, [data, primeCache]);

  return {
    mdPicks: data ?? [],
    isLoading,
    error,
  };
}
