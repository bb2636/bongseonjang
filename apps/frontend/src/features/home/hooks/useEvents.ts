import { useQuery } from '@tanstack/react-query';
import { fetchEvents, type EventData } from '../api/eventApi';

const STALE_TIME = 5 * 60 * 1000;

export function useEvents() {
  const { data, isLoading, error } = useQuery<EventData[]>({
    queryKey: ['events'],
    queryFn: fetchEvents,
    staleTime: STALE_TIME,
  });

  return {
    events: data ?? [],
    isLoading,
    error,
  };
}
