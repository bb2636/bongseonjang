import { useQuery } from '@tanstack/react-query';
import { fetchBongseonjangTvImages } from '../api/bongseonjangTvApi';
import type { BongseonjangTvImage } from '../types/bongseonjangTv';

const QUERY_KEY = ['bongseonjangTvImages'];
const STALE_TIME = 5 * 60 * 1000;

export function useBongseonjangTvImages() {
  const { data, isLoading, error } = useQuery<BongseonjangTvImage[]>({
    queryKey: QUERY_KEY,
    queryFn: fetchBongseonjangTvImages,
    staleTime: STALE_TIME,
  });

  return {
    tvImages: data ?? [],
    isLoading,
    error,
  };
}
