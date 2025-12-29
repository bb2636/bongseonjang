import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  fetchAllProducts, 
  fetchBestProducts, 
  fetchNewProducts, 
  fetchProductsByCategoryId 
} from '../../home/api/productApi';
import type { ProductCardData } from '@/components/ProductCard';
import { useProductListCache } from '../../productDetail/hooks/useProductListCache';

const STALE_TIME = 5 * 60 * 1000;
const STATIC_SLUGS = ['all', 'best', 'new'];

function isStaticCategory(slug: string): boolean {
  return STATIC_SLUGS.includes(slug);
}

export function useCategoryProductsPage() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const activeSlug = slug || 'all';
  const { primeProductDetailCache } = useProductListCache();
  
  const isDbCategory = !isStaticCategory(activeSlug);
  const categoryId = isDbCategory ? activeSlug : null;

  const { data, isLoading, error } = useQuery<ProductCardData[]>({
    queryKey: ['categoryProducts', activeSlug],
    queryFn: async () => {
      if (activeSlug === 'all') {
        return fetchAllProducts();
      }
      if (activeSlug === 'best') {
        return fetchBestProducts();
      }
      if (activeSlug === 'new') {
        return fetchNewProducts();
      }
      if (isDbCategory && categoryId) {
        const result = await fetchProductsByCategoryId(categoryId);
        return result.products;
      }
      return [];
    },
    staleTime: STALE_TIME,
  });

  useEffect(() => {
    if (data && data.length > 0) {
      primeProductDetailCache(data);
    }
  }, [data, primeProductDetailCache]);

  const handleTabChange = (newSlug: string) => {
    navigate(`/category/${newSlug}`, { replace: true });
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  return {
    state: {
      activeSlug,
      products: data ?? [],
      isLoading,
      error: error as Error | null,
    },
    actions: {
      handleTabChange,
      handleProductClick,
      handleCartClick,
      handleBack,
      handleLogoClick,
    },
  };
}
