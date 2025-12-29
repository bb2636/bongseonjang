import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { STATIC_CATEGORIES, Category } from '../types/category';
import { useProductCategories } from '@/features/home/hooks/useProductCategories';

export function useCategoryPage() {
  const navigate = useNavigate();
  const { categories: dbCategories, isLoading } = useProductCategories();

  const categories = useMemo(() => {
    const safeDbCategories = dbCategories ?? [];
    const dynamicCategories: Category[] = safeDbCategories
      .filter((cat) => cat.id !== 'all')
      .map((cat) => ({
        id: cat.id,
        name: cat.label,
        slug: `category-${cat.id}`,
      }));

    return [...STATIC_CATEGORIES, ...dynamicCategories];
  }, [dbCategories]);

  const handleCategoryClick = (category: Category) => {
    navigate(`/category/${category.slug}`);
  };

  const handleBrandClick = (brandId: string) => {
    navigate(`/?brand=${brandId}`);
  };

  return {
    state: {
      categories,
      isLoading,
    },
    actions: {
      handleCategoryClick,
      handleBrandClick,
    },
  };
}
