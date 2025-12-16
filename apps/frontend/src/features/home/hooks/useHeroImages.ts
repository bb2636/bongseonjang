import { useQuery } from '@tanstack/react-query';
import { fetchHeroImages } from '../api/heroImageApi';
import type { HeroImage } from '../types/heroImage';

const STALE_TIME = 5 * 60 * 1000;

export function useHeroImages() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['heroImages'],
    queryFn: fetchHeroImages,
    staleTime: STALE_TIME,
  });

  const heroImages: HeroImage[] = data?.data ?? [];

  return {
    heroImages,
    isLoading,
    error,
  };
}
