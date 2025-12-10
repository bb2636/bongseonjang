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
  products: ProductCardData[];
  isLoading: boolean;
  error: Error | null;
  handleProductClick: (productId: string) => void;
  handleAddToCart: (productId: string) => void;
  handleToggleFavorite: (productId: string) => void;
  handleCartClick: () => void;
  handleBack: () => void;
}

export function useCategoryProductsPage(): UseCategoryProductsPageReturn {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  
  const displayCategoryName = SLUG_TO_DISPLAY_CATEGORY[slug || 'all'] || '베스트';
  const { products, isLoading, error } = useProductsByCategory(displayCategoryName);

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

  return {
    products,
    isLoading,
    error: error as Error | null,
    handleProductClick,
    handleAddToCart,
    handleToggleFavorite,
    handleCartClick,
    handleBack,
  };
}
