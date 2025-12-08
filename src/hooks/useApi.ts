import { useState, useCallback } from 'react';

interface UseApiOptions<TData> {
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
}

interface UseApiResult<TData, TVariables> {
  data: TData | null;
  error: Error | null;
  isLoading: boolean;
  execute: (variables: TVariables) => Promise<TData | null>;
  reset: () => void;
}

export function useApi<TData, TVariables>(
  apiFunction: (variables: TVariables) => Promise<TData>,
  options: UseApiOptions<TData> = {}
): UseApiResult<TData, TVariables> {
  const [data, setData] = useState<TData | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(async (variables: TVariables): Promise<TData | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiFunction(variables);
      setData(result);
      options.onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      options.onError?.(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [apiFunction, options]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { data, error, isLoading, execute, reset };
}
