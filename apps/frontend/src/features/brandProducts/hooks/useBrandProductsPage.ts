import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/apiClient';
import type { ProductCardData } from '@/components/ProductCard';

const STALE_TIME = 5 * 60 * 1000;

const BRAND_TAG_MAP: Record<string, string> = {
  badameun: '바담은 제품',
  obada: '오바다 제품',
  fourseason: '포시즌 제품',
  bongcook: '봉쿡 제품',
};

const BRAND_DISPLAY_NAMES: Record<string, string> = {
  badameun: '바담은',
  obada: '오바다',
  fourseason: '포시즌',
  bongcook: '봉쿡',
};

async function fetchProductsByBrand(brandId: string): Promise<ProductCardData[]> {
  const tagName = BRAND_TAG_MAP[brandId];
  if (!tagName) {
    return [];
  }
  return apiClient.get<ProductCardData[]>(`/products/tag/${encodeURIComponent(tagName)}`);
}

export function useBrandProductsPage() {
  const navigate = useNavigate();
  const { brandId } = useParams<{ brandId: string }>();
  const activeBrandId = brandId || 'badameun';

  const { data, isLoading, error } = useQuery<ProductCardData[]>({
    queryKey: ['brandProducts', activeBrandId],
    queryFn: () => fetchProductsByBrand(activeBrandId),
    staleTime: STALE_TIME,
  });

  const handleBrandChange = useCallback((newBrandId: string) => {
    navigate(`/brand/${newBrandId}`, { replace: true });
  }, [navigate]);

  const handleProductClick = useCallback((productId: string) => {
    navigate(`/product/${productId}`);
  }, [navigate]);

  const handleCartClick = useCallback(() => {
    navigate('/cart');
  }, [navigate]);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return {
    state: {
      activeBrandId,
      brandDisplayName: BRAND_DISPLAY_NAMES[activeBrandId] || activeBrandId,
      products: data ?? [],
      isLoading,
      error: error as Error | null,
    },
    actions: {
      handleBrandChange,
      handleProductClick,
      handleCartClick,
      handleBack,
    },
  };
}
