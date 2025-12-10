import { useNavigate } from 'react-router-dom';
import { CATEGORIES, Category } from '../types/category';

export interface UseCategoryPageReturn {
  categories: Category[];
  handleCategoryClick: (category: Category) => void;
  handleCartClick: () => void;
  handleLogoClick: () => void;
}

export function useCategoryPage(): UseCategoryPageReturn {
  const navigate = useNavigate();

  const handleCategoryClick = (category: Category) => {
    navigate('/');
  };

  const handleCartClick = () => {
    console.log('Cart clicked');
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  return {
    categories: CATEGORIES,
    handleCategoryClick,
    handleCartClick,
    handleLogoClick,
  };
}
