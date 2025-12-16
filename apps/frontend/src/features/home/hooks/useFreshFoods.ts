import { useQuery } from '@tanstack/react-query';
import { fetchFreshFoods } from '../api/freshFoodApi';
import type { FreshFood } from '../types/freshFood';

const QUERY_KEY = ['freshFoods'];
const STALE_TIME = 5 * 60 * 1000;

export function useFreshFoods() {
  const { data, isLoading, error } = useQuery<FreshFood[]>({
    queryKey: QUERY_KEY,
    queryFn: fetchFreshFoods,
    staleTime: STALE_TIME,
  });

  return {
    freshFoods: data ?? [],
    isLoading,
    error,
  };
}
