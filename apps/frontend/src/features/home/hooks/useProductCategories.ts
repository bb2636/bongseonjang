import { useState, useEffect } from 'react';
import { apiClient } from '@/services/apiClient';

interface ApiCategory {
  id: string;
  name: string;
  sortOrder: number;
}

interface ProductCategory {
  id: string;
  label: string;
}

const ALL_CATEGORY: ProductCategory = { id: 'all', label: '전체' };

export function useProductCategories() {
  const [categories, setCategories] = useState<ProductCategory[]>([ALL_CATEGORY]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const apiCategories = await apiClient.get<ApiCategory[]>('/products/categories');
        const brandCategoryNames = ['바담은', '봉쿡', '포시즌', '오바다'];
        const mappedCategories = apiCategories
          .filter((cat) => !brandCategoryNames.includes(cat.name))
          .map((cat) => ({
            id: cat.id,
            label: cat.name,
          }));
        setCategories([ALL_CATEGORY, ...mappedCategories]);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch product categories:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch categories'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, isLoading, error };
}
