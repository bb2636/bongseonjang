import { useNavigate } from 'react-router-dom';
import { CATEGORIES, Category } from '../types/category';

export interface UseCategoryPageReturn {
  categories: Category[];
  handleCategoryClick: (category: Category) => void;
  handleBrandClick: (brandId: string) => void;
}

export function useCategoryPage(): UseCategoryPageReturn {
  const navigate = useNavigate();

  const handleCategoryClick = (category: Category) => {
    navigate(`/category/${category.slug}`);
  };

  const handleBrandClick = (brandId: string) => {
    navigate(`/?brand=${brandId}`);
  };

  return {
    categories: CATEGORIES,
    handleCategoryClick,
    handleBrandClick,
  };
}
