import { useNavigate, useParams } from 'react-router-dom';
import { useProductsByCategory } from '../../home/hooks/useProductsByCategory';
import type { ProductCardData } from '@/components/ProductCard';

const SLUG_TO_DISPLAY_CATEGORY: Record<string, string> = {
  'all': '',
  'new': '신상품',
  'best': '베스트',
  'seasonal': '제철 수산물',
  'frozen': '급랭 수산물',
  'prepared': '손질 수산물',
  'pickled': '바담은 절임류',
};

export interface UseCategoryProductsPageReturn {
  activeSlug: string;
  products: ProductCardData[];
  isLoading: boolean;
  error: Error | null;
  handleTabChange: (slug: string) => void;
  handleProductClick: (productId: string) => void;
  handleAddToCart: (productId: string) => void;
  handleToggleFavorite: (productId: string) => void;
  handleCartClick: () => void;
  handleBack: () => void;
  handleLogoClick: () => void;
}

export function useCategoryProductsPage(): UseCategoryProductsPageReturn {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const activeSlug = slug || 'all';
  
  const displayCategoryName = SLUG_TO_DISPLAY_CATEGORY[activeSlug] || '';
  const { products, isLoading, error } = useProductsByCategory(displayCategoryName);

  const handleTabChange = (newSlug: string) => {
    navigate(`/category/${newSlug}`, { replace: true });
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = (productId: string) => {
    console.log('Add to cart:', productId);
  };

  const handleToggleFavorite = (productId: string) => {
    console.log('Toggle favorite:', productId);
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
    activeSlug,
    products,
    isLoading,
    error: error as Error | null,
    handleTabChange,
    handleProductClick,
    handleAddToCart,
    handleToggleFavorite,
    handleCartClick,
    handleBack,
    handleLogoClick,
  };
}
