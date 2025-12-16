import { useNavigate } from 'react-router-dom';
import { CATEGORIES, Category } from '../types/category';

export function useCategoryPage() {
  const navigate = useNavigate();

  const handleCategoryClick = (category: Category) => {
    navigate(`/category/${category.slug}`);
  };

  const handleBrandClick = (brandId: string) => {
    navigate(`/?brand=${brandId}`);
  };

  return {
    state: {
      categories: CATEGORIES,
    },
    actions: {
      handleCategoryClick,
      handleBrandClick,
    },
  };
}
