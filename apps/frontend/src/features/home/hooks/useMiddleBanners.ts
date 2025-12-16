import { useQuery } from '@tanstack/react-query';
import { fetchMiddleBanners } from '../api/middleBannerApi';
import type { MiddleBannerImage } from '../types/middleBanner';

const QUERY_KEY = ['middleBanners'];
const STALE_TIME = 5 * 60 * 1000;

export function useMiddleBanners() {
  const { data, isLoading, error } = useQuery<MiddleBannerImage[]>({
    queryKey: QUERY_KEY,
    queryFn: fetchMiddleBanners,
    staleTime: STALE_TIME,
  });

  return {
    middleBanners: data ?? [],
    isLoading,
    error,
  };
}
