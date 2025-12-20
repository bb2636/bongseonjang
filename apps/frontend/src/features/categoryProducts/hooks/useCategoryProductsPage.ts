import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  fetchAllProducts, 
  fetchBestProducts, 
  fetchNewProducts, 
  fetchProductsByCategoryId 
} from '../../home/api/productApi';
import type { ProductCardData } from '@/components/ProductCard';

const STALE_TIME = 5 * 60 * 1000;

function extractCategoryId(slug: string): string | null {
  if (slug.startsWith('category-')) {
    return slug.replace('category-', '');
  }
  return null;
}

export function useCategoryProductsPage() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const activeSlug = slug || 'all';
  
  const categoryId = extractCategoryId(activeSlug);
  const isDbCategory = categoryId !== null;

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
