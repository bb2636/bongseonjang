import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '@/shared/config/apiConfig';

export type TabType = 'exposure' | 'display' | 'product';

export interface ExposureCategoryItem {
  id: number;
  name: string;
  sortOrder: number;
}

export interface DisplayCategoryItem {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  productCount: number;
}

export interface ProductCategoryItem {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  productCount: number;
}

export type CategoryItem = ExposureCategoryItem | DisplayCategoryItem | ProductCategoryItem;

export interface CategoryFormData {
  name: string;
  sortOrder: number;
  isActive?: boolean;
}

const TAB_ENDPOINTS: Record<TabType, string> = {
  exposure: '/admin/categories/exposure-categories',
  display: '/admin/categories/display-categories',
  product: '/admin/categories/product-categories',
};

export function useCategoryManagement() {
  const [activeTab, setActiveTab] = useState<TabType>('exposure');
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const getHeaders = useCallback(() => {
    const token = sessionStorage.getItem('admin_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, []);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}${TAB_ENDPOINTS[activeTab]}`, {
        headers: getHeaders(),
      });
      if (!response.ok) {
        throw new Error('카테고리 목록을 불러오는데 실패했습니다');
      }
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, getHeaders]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const createCategory = async (formData: CategoryFormData) => {
    try {
      const body: Record<string, unknown> = { name: formData.name, sortOrder: formData.sortOrder };
      if (activeTab !== 'exposure') {
        body.isActive = formData.isActive ?? true;
      }
      const response = await fetch(`${API_BASE_URL}${TAB_ENDPOINTS[activeTab]}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '카테고리 생성에 실패했습니다');
      }
      await fetchCategories();
      setIsFormOpen(false);
    } catch (err) {
      throw err;
    }
  };

  const updateCategory = async (id: string | number, formData: CategoryFormData) => {
    try {
      const body: Record<string, unknown> = { name: formData.name, sortOrder: formData.sortOrder };
      if (activeTab !== 'exposure') {
        body.isActive = formData.isActive;
      }
      const response = await fetch(`${API_BASE_URL}${TAB_ENDPOINTS[activeTab]}/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '카테고리 수정에 실패했습니다');
      }
      await fetchCategories();
      setIsFormOpen(false);
      setEditingCategory(null);
    } catch (err) {
      throw err;
    }
  };

  const deleteCategory = async (id: string | number) => {
    try {
      const response = await fetch(`${API_BASE_URL}${TAB_ENDPOINTS[activeTab]}/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '카테고리 삭제에 실패했습니다');
      }
      await fetchCategories();
    } catch (err) {
      throw err;
    }
  };

  const openCreateForm = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const openEditForm = (category: CategoryItem) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
  };

  const changeTab = (tab: TabType) => {
    setActiveTab(tab);
  };

  return {
    activeTab,
    categories,
    isLoading,
    error,
    editingCategory,
    isFormOpen,
    changeTab,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    openCreateForm,
    openEditForm,
    closeForm,
  };
}
