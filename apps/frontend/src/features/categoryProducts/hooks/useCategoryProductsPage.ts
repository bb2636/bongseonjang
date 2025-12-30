import { useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useGoBack } from '../../../hooks/useGoBack';
import { 
  fetchAllProducts, 
  fetchBestProducts,
  fetchNewProducts,
  fetchProductsByCategoryId,
  type ProductFilter,
} from '../../home/api/productApi';
import type { ProductCardData } from '@/components/ProductCard';
import { useProductListCache } from '../../productDetail/hooks/useProductListCache';
import { useProductCategories } from '../../home/hooks/useProductCategories';

const STALE_TIME = 5 * 60 * 1000;
const STATIC_SLUGS = ['all', 'best', 'new'];
const FILTERABLE_SLUGS = ['best', 'new'];

function isStaticCategory(slug: string): boolean {
  return STATIC_SLUGS.includes(slug);
}

function isFilterableCategory(slug: string): boolean {
  return FILTERABLE_SLUGS.includes(slug);
}

export function useCategoryProductsPage() {
  const navigate = useNavigate();
  const goBack = useGoBack();
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSlug = slug || 'all';
  const { primeProductDetailCache } = useProductListCache();
  const { categories } = useProductCategories();
  
  const selectedSubCategory = searchParams.get('category') || 'all';
  
  const isDbCategory = !isStaticCategory(activeSlug);
  const categoryId = isDbCategory ? activeSlug : null;
  const showFilterChips = isFilterableCategory(activeSlug);

  const filter: ProductFilter = {};
  if (selectedSubCategory && selectedSubCategory !== 'all') {
    filter.productCategory = selectedSubCategory;
  }

  const { data, isLoading, error } = useQuery<ProductCardData[]>({
    queryKey: ['categoryProducts', activeSlug, selectedSubCategory],
    queryFn: async () => {
      if (activeSlug === 'all') {
        return fetchAllProducts(filter);
      }
      if (activeSlug === 'best') {
        return fetchBestProducts(filter);
      }
      if (activeSlug === 'new') {
        return fetchNewProducts(filter);
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

  const handleSubCategoryChange = useCallback((categoryId: string) => {
    if (categoryId === 'all') {
      setSearchParams({}, { replace: true });
    } else {
      setSearchParams({ category: categoryId }, { replace: true });
    }
  }, [setSearchParams]);

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  const handleBack = () => {
    goBack();
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
      showFilterChips,
      subCategories: categories,
      selectedSubCategory,
    },
    actions: {
      handleTabChange,
      handleSubCategoryChange,
      handleProductClick,
      handleCartClick,
      handleBack,
      handleLogoClick,
    },
  };
}
