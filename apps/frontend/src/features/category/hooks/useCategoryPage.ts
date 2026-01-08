import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { STATIC_CATEGORIES, Category } from '../types/category';
import { useProductCategories } from '@/features/home/hooks/useProductCategories';

export function useCategoryPage() {
  const navigate = useNavigate();
  const { categories: dbCategories, isLoading } = useProductCategories();

  const categories = useMemo(() => {
    const safeDbCategories = dbCategories ?? [];
    const brandCategoryNames = ['바담은', '봉쿡', '포시즌', '온바다'];
    const dynamicCategories: Category[] = safeDbCategories
      .filter((cat) => cat.id !== 'all' && !brandCategoryNames.includes(cat.label))
      .map((cat) => ({
        id: cat.id,
        name: cat.label,
        slug: cat.id,
      }));

    return [...STATIC_CATEGORIES, ...dynamicCategories];
  }, [dbCategories]);

  const handleCategoryClick = (category: Category) => {
    navigate(`/category/${category.slug}`);
  };

  const handleBrandClick = (brandId: string) => {
    navigate(`/brand/${brandId}`);
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
