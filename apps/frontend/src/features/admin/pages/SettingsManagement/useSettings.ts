import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '@/shared/config/apiConfig';

interface CacheInfo {
  size: number;
  maxSize: number;
}

interface CacheStatus {
  caches: {
    home: CacheInfo;
    reviews: CacheInfo;
  };
}

export function useSettings() {
  const [cacheStatus, setCacheStatus] = useState<CacheStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [snackbar, setSnackbar] = useState<{ isOpen: boolean; title: string; isError?: boolean }>({
    isOpen: false,
    title: '',
    isError: false,
  });

  const getHeaders = useCallback(() => {
    const token = sessionStorage.getItem('admin_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, []);

  const fetchCacheStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/settings/cache/status`, {
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch cache status');
      const data: CacheStatus = await response.json();
      setCacheStatus(data);
    } catch {
      setCacheStatus(null);
    } finally {
      setIsLoading(false);
    }
  }, [getHeaders]);

  const clearCache = useCallback(async (cacheType: 'all' | 'home' | 'reviews') => {
    setIsClearingCache(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/settings/cache/clear`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ cacheType }),
      });
      if (!response.ok) throw new Error('Failed to clear cache');
      const data = await response.json();
      setSnackbar({ isOpen: true, title: data.message || '캐시가 초기화되었습니다' });
      await fetchCacheStatus();
    } catch {
      setSnackbar({ isOpen: true, title: '캐시 초기화에 실패했습니다', isError: true });
    } finally {
      setIsClearingCache(false);
    }
  }, [getHeaders, fetchCacheStatus]);

  const closeSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, isOpen: false }));
  }, []);

  useEffect(() => {
    fetchCacheStatus();
  }, [fetchCacheStatus]);

  return {
    cacheStatus,
    isLoading,
    isClearingCache,
    clearCache,
    snackbar,
    closeSnackbar,
  };
}
