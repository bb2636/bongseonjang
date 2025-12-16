import { useQuery } from '@tanstack/react-query';
import { fetchMdPicks } from '../api/mdPickApi';
import type { MdPickProduct } from '../types/mdPick';

const STALE_TIME = 5 * 60 * 1000;

export function useMdPicks() {
  const { data, isLoading, error } = useQuery<MdPickProduct[]>({
    queryKey: ['mdPicks'],
    queryFn: fetchMdPicks,
    staleTime: STALE_TIME,
  });

  return {
    mdPicks: data ?? [],
    isLoading,
    error,
  };
}
